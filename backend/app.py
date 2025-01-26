from flask import Flask, jsonify, request
import mysql.connector
import json
from datetime import datetime
from flask_cors import CORS
import logging
import base64

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def get_db_connection():
    try:
        return mysql.connector.connect(
            host="",
            user="", 
            password="",
            database="peppypick"
        )
    except mysql.connector.Error as err:
        logging.error(f"Database connection error: {err}")
        return None

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    company_id = request.args.get('company_id')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT 
            j.job_id,
            j.job_title,
            j.created_date,
            c.comp_name,
            c.company_logo,
            COUNT(DISTINCT ac.cand_id) as total_applications,
            COUNT(DISTINCT tcr.resp_user_id) as total_submissions,
            COUNT(DISTINCT CASE WHEN tcr.final_score IS NOT NULL THEN tcr.resp_user_id END) as completed_submissions
        FROM t_jobs j
        LEFT JOIN t_company c ON j.comp_id = c.comp_id
        LEFT JOIN applied_candidates ac ON j.job_id = ac.job_id
        LEFT JOIN t_c_response tcr ON j.job_id = tcr.resp_job_id
        WHERE j.comp_id = %s
        GROUP BY j.job_id, j.job_title, j.created_date, c.comp_name
        ORDER BY j.created_date DESC
    """
    
    cursor.execute(query, (company_id,))
    jobs = cursor.fetchall()
    for job in jobs:
        if job['company_logo']:
            job['company_logo'] = base64.b64encode(job['company_logo']).decode('utf-8')
        else:
            job['company_logo'] = None
            
    cursor.close()
    conn.close()
    
    return jsonify(jobs)

@app.route('/api/jobs/<job_id>/analytics', methods=['GET'])
def get_job_analytics(job_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get all responses for this job
    cursor.execute("""
        SELECT 
            resp_video_data,
            resp_video_aws_nums,
            report_card,
            resp_resume_score,
            resp_test_role_score,
            resp_test_writing_score,
            resp_test_writing,
            final_score,
            tab_switch_count,
            resp_date,
            resp_test_role_qns,
            resp_test_role_ans,
            resp_video_resp,
            resp_screen_recording_s3
        FROM t_c_response 
        WHERE resp_job_id = %s
    """, (job_id,))
    
    responses = cursor.fetchall()
    
    # Overview Statistics
    cursor.execute("""
        SELECT 
            COUNT(DISTINCT ac.cand_id) as total_applications,
            COUNT(DISTINCT CASE WHEN tcr.final_score IS NOT NULL THEN tcr.resp_user_id END) as complete_submissions,
            COUNT(DISTINCT CASE WHEN tcr.final_score IS NULL AND tcr.resp_user_id IS NOT NULL THEN tcr.resp_user_id END) as incomplete_submissions
        FROM t_jobs j
        LEFT JOIN applied_candidates ac ON j.job_id = ac.job_id
        LEFT JOIN t_c_response tcr ON j.job_id = tcr.resp_job_id
        WHERE j.job_id = %s
    """,(job_id,))
    
    overview = cursor.fetchone()
    overview['not_started'] = overview['total_applications'] - (overview['complete_submissions'] + overview['incomplete_submissions'])

    # Process video assessment data
    video_scores = []
    emotional_analysis = {
        "CALM": 0,
        "CONFIDENT": 0,
        "NERVOUS": 0,
        "SAD": 0,
        "HAPPY": 0,
        "ANGRY": 0,
        "CONFUSED": 0
    }
    
    for response in responses:
        if response['report_card']:
            report = json.loads(response['report_card'])
            if 'video_score' in report:
                video_scores.append(float(report['video_score']))
        
        if response['resp_video_aws_nums']:
            try:
                frames = json.loads(response['resp_video_aws_nums'])
                # Process each frame's emotion
                for frame in frames:
                    if 'em_type' in frame and isinstance(frame['em_type'], list) and len(frame['em_type']) == 2:
                        emotion = frame['em_type'][0]
                        confidence = float(frame['em_type'][1])
                        # Only count emotions with high confidence (>50%)
                        if confidence > 50 and emotion in emotional_analysis:
                            emotional_analysis[emotion] += 1
            except json.JSONDecodeError:
                logging.error(f"Error parsing video_aws_nums for response")
                continue

    # Convert emotional analysis to array format for the chart
    emotional_analysis_array = [
        {"emotion": emotion, "count": count}
        for emotion, count in emotional_analysis.items()
        if count > 0  # Only include emotions that were detected
    ]
    
    # Sort by count in descending order
    emotional_analysis_array.sort(key=lambda x: x['count'], reverse=True)

    # Calculate video assessment metrics
    video_assessment = {
        "average_score": round(sum(video_scores) / len(video_scores), 1) if video_scores else 0,
        "above_ideal": len([score for score in video_scores if score > 7]),
        "emotional_analysis": emotional_analysis_array
    }

    # Process MCQ performance
    mcq_scores = []
    difficulty_stats = {
        'easy': {'correct': 0, 'total': 0},
        'medium': {'correct': 0, 'total': 0},
        'hard': {'correct': 0, 'total': 0}
    }    
    for response in responses:
        if response['report_card']:
            try:
                report = json.loads(response['report_card'])
                
                # Get MCQ score
                if 'mcq_test_score' in report:
                    score = int(report['mcq_test_score'].split('/')[0])
                    mcq_scores.append(score)
                
                # Process MCQ responses for difficulty analysis
                if 'mcq_response' in report:
                    mcq_responses = json.loads(report['mcq_response'])
                    
                    for question in mcq_responses:
                        difficulty = question['difficultyLevel'].lower()
                        if difficulty in difficulty_stats:
                            difficulty_stats[difficulty]['total'] += 1
                            if question['candidateResponse'] == question['answer']:
                                difficulty_stats[difficulty]['correct'] += 1
                                
                    logging.info(f"Processed MCQ response - Stats: {difficulty_stats}")
                    
            except json.JSONDecodeError as e:
                logging.error(f"Error parsing report card: {str(e)}")
                continue
            except Exception as e:
                logging.error(f"Error processing MCQ data: {str(e)}")
                continue

    # Calculate success rates for each difficulty level
    difficulty_analysis = []
    for level, stats in difficulty_stats.items():
        total = stats['total']
        correct = stats['correct']
        success_rate = round((correct / total * 100) if total > 0 else 0)
        
        difficulty_analysis.append({
            'level': level.capitalize(),
            'successRate': success_rate,
            'correct': correct,
            'total': total
        })

    logging.info(f"Final MCQ analysis: {difficulty_analysis}")

    mcq_performance = {
        "average_score": round(sum(mcq_scores) / len(mcq_scores), 1) if mcq_scores else 0,
        "above_ideal": len([score for score in mcq_scores if score > 7]),
        "difficulty_analysis": difficulty_analysis
    }

    # Process resume analysis
    resume_scores = []
    keyword_scores = []
    relevance_scores = []
    for response in responses:
        if response['report_card']:
            try:
                report = json.loads(response['report_card'])
                if 'resume_keyword' in report and report['resume_keyword']:  # Check if value is not empty
                    try:
                        keyword_scores.append(float(report['resume_keyword']))
                    except ValueError:
                        logging.error(f"Invalid resume_keyword value: {report['resume_keyword']}")
                if 'resume_relevance_to_jd' in report and report['resume_relevance_to_jd']:  # Check if value is not empty
                    try:
                        relevance_scores.append(float(report['resume_relevance_to_jd']))
                    except ValueError:
                        logging.error(f"Invalid resume_relevance_to_jd value: {report['resume_relevance_to_jd']}")
            except json.JSONDecodeError:
                logging.error("Error parsing report card for resume scores")
                continue

    resume_analysis = {
        "keyword_match": round((sum(keyword_scores) / len(keyword_scores)) * 100 if keyword_scores else 0),
        "relevance_score": round((sum(relevance_scores) / len(relevance_scores)) * 100 if relevance_scores else 0)
    }

    # Calculate case study metrics from writing test scores
    writing_scores = []
    completion_count = 0
    for response in responses:
        if response['resp_test_writing_score']:
            writing_score = json.loads(response['resp_test_writing_score'])
            relevance_score = writing_score.get('relevance_score', 0)
            sentiment_score = writing_score.get('sentiment_score', 0)
            avg_score = (relevance_score + sentiment_score) / 2
            writing_scores.append(avg_score)
            if response['resp_test_writing']:
                completion_count += 1

    completion_rate = round((completion_count / len(responses)) * 100) if responses else 0
    above_threshold = len([score for score in writing_scores if score > 7])
    above_threshold_percentage = round((above_threshold / len(writing_scores)) * 100) if writing_scores else 0

    case_study = {
        "average_score": round(sum(writing_scores) / len(writing_scores), 1) if writing_scores else 0,
        "completion_rate": completion_rate,
        "key_insights": [
            f"{above_threshold_percentage}% candidates scored above ideal threshold",
            f"{completion_rate}% completion rate indicates {'good' if completion_rate > 80 else 'average' if completion_rate > 60 else 'poor'} engagement",
            f"Average score: {round(sum(writing_scores) / len(writing_scores), 1) if writing_scores else 0}/10"
        ]
    }

    # Timeline data
    cursor.execute("""
        SELECT 
            DATE(ac.created_at) as date,
            COUNT(ac.cand_id) as applications
        FROM applied_candidates ac
        WHERE ac.job_id = %s
        GROUP BY DATE(ac.created_at)
        ORDER BY DATE(ac.created_at)
    """, (job_id,))
    
    timeline = cursor.fetchall()
    
    # Technical Insights
    cursor.execute("""
        SELECT 
            COUNT(DISTINCT resp_user_id) as total_responses,
            COUNT(DISTINCT CASE WHEN tab_switch_count = 0 THEN resp_user_id END) as compliant,
            COUNT(DISTINCT CASE WHEN tab_switch_count > 0 THEN resp_user_id END) as non_compliant,
            COUNT(DISTINCT CASE WHEN resp_video_resp IS NOT NULL THEN resp_user_id END) as video_success,
            COUNT(DISTINCT CASE WHEN resp_screen_recording_s3 IS NOT NULL THEN resp_user_id END) as screen_success,
            AVG(tab_switch_count) as avg_switches,
            MAX(tab_switch_count) as max_switches
        FROM t_c_response 
        WHERE resp_job_id = %s
    """, (job_id,))

    tech_stats = cursor.fetchone()

    if tech_stats and tech_stats['total_responses'] > 0:
        technical_insights = {
            "total_responses": tech_stats['total_responses'],
            "tab_switching": {
                "average": float(tech_stats['avg_switches'] or 0),
                "max": tech_stats['max_switches'] or 0,
                "compliant": tech_stats['compliant'] or 0,
                "non_compliant": tech_stats['non_compliant'] or 0
            },
            "video_upload_success": tech_stats['video_success'] or 0,
            "screen_recording_success": tech_stats['screen_success'] or 0
        }
    else:
        technical_insights = None
        
    # Geographic Distribution
    cursor.execute("""
        SELECT 
            COALESCE(ac.home_address, 'Unknown') as home_address,
            COUNT(DISTINCT ac.cand_id) as candidate_count
        FROM applied_candidates ac
        WHERE ac.job_id = %s
        GROUP BY ac.home_address
    """, (job_id,))
    
    geography = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "overview": overview,
        "timeline": timeline,
        "video_assessment": video_assessment,
        "mcq_performance": mcq_performance,
        "resume_analysis": resume_analysis,
        "case_study": case_study,
        "technical_insights": technical_insights,
        "geography": geography
    })

if __name__ == '__main__':
    app.run(debug=True)