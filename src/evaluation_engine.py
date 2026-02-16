"""
Claude API를 사용한 평가 엔진
루브릭 기반 AI 평가 및 피드백 생성
"""

import json
import re
from typing import Dict, Any, Optional, Tuple
from anthropic import Anthropic
from src.rubrics import RUBRICS, PROFICIENCY_LEVELS


class EvaluationEngine:
    """Claude API 기반 평가 엔진"""
    
    def __init__(self, api_key: str):
        self.client = Anthropic()
        self.api_key = api_key
    
    def _build_system_prompt(self, practice_type: str) -> str:
        """실천별 시스템 프롬프트 생성"""
        rubric = RUBRICS.get(practice_type, {})
        
        items_description = ""
        for item_key, item_data in rubric.get("items", {}).items():
            items_description += f"\n### {item_data['name']}\n"
            items_description += f"{item_data['description']}\n"
            items_description += "수준:\n"
            for level, description in item_data['levels'].items():
                items_description += f"- {level}점: {description}\n"
        
        system_prompt = f"""당신은 교육 평가 전문가입니다. 고등학교 AI/정보 교과 학생들의 실천 활동 산출물을 평가합니다.

【평가 원칙】
1. 학생 이름은 고려하지 않습니다 (비식별화)
2. 루브릭 기준에 엄격하게 따릅니다
3. 각 항목마다 점수와 피드백을 제시합니다
4. 격려와 개선 방향을 포함한 건설적 피드백을 제공합니다
5. 한국어로 작성합니다

【평가 대상: {rubric.get('name', '')}】

{items_description}

【평가 출력 형식】
JSON으로 다음 구조로 응답합니다:
{{
  "item_scores": {{
    "항목_key": {{"score": 점수, "feedback": "해당 항목 피드백"}},
    ...
  }},
  "total_score": 전체점수,
  "overall_feedback": "종합 피드백 및 개선 방향"
}}

전체 점수는 각 항목 점수의 평균입니다.
"""
        return system_prompt
    
    def _anonymize_text(self, text: str) -> str:
        """학생 이름 등을 제거 (비식별화)"""
        # 일반적인 이름 패턴 제거 (실제로는 학생 정보를 받지 않음)
        return text
    
    def evaluate_artifact(
        self,
        practice_type: str,
        artifact_text: str,
        student_info: Dict[str, Any] = None
    ) -> Tuple[Dict[str, Any], str]:
        """
        산출물 평가
        
        Returns:
            (평가 결과 dict, API 응답 원문)
        """
        system_prompt = self._build_system_prompt(practice_type)
        
        # 비식별화
        text_to_eval = self._anonymize_text(artifact_text)
        
        user_prompt = f"""다음 학생 산출물을 평가해주세요:

【산출물】
{text_to_eval}

루브릭 기준에 따라 점수를 매기고 피드백을 제공해주세요."""
        
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            response_text = response.content[0].text
            
            # JSON 추출 시도
            evaluation_result = self._parse_evaluation_response(response_text)
            
            return evaluation_result, response_text
        
        except Exception as e:
            return {"error": str(e)}, ""
    
    def _parse_evaluation_response(self, response_text: str) -> Dict[str, Any]:
        """API 응답에서 JSON 추출"""
        try:
            # JSON 부분 찾기
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                json_str = json_match.group()
                result = json.loads(json_str)
                return result
        except:
            pass
        
        # JSON 파싱 실패 시 텍스트로 반환
        return {"raw_response": response_text}
    
    def generate_growth_analysis(
        self,
        practice_type: str,
        artifacts: list
    ) -> Tuple[Dict[str, Any], str]:
        """
        여러 산출물을 비교하여 성장 분석
        
        Args:
            practice_type: 실천 타입
            artifacts: [{"artifact_text": str, "date": str, "sequence": int}, ...]
        
        Returns:
            (성장 분석 결과, API 응답 원문)
        """
        system_prompt = """당신은 교육 평가 전문가입니다. 학생의 같은 실천 활동에 대한 여러 산출물을 분석하여 성장 과정을 평가합니다.

【분석 원칙】
1. 시간 순서대로 항목별 성장을 추적합니다
2. 구체적 개선 사례를 제시합니다
3. 학생의 강점 강화 방향을 제안합니다
4. 한국어로 작성합니다

【분석 출력 형식】
JSON으로 다음 구조로 응답합니다:
{
  "growth_trends": {"항목_key": [초기_점수, 최신_점수, "개선_방향"]},
  "key_improvements": ["개선 사항 1", "개선 사항 2", ...],
  "strengths_to_enhance": "강점을 어떻게 더 살릴지",
  "recommendations": "향후 학습 방향 제안"
}
"""
        
        artifacts_description = ""
        for i, artifact in enumerate(artifacts, 1):
            date = artifact.get("date", "미표기")
            text = artifact.get("artifact_text", "")
            artifacts_description += f"\n【산출물 {i} ({date})】\n{text}\n"
        
        user_prompt = f"""다음 학생의 같은 실천 활동에 대한 여러 산출물을 시간순으로 비교 분석해주세요:

{artifacts_description}

이 산출물들을 통해 학생의 성장 과정을 분석하고 향후 학습 방향을 제안해주세요."""
        
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            response_text = response.content[0].text
            analysis_result = self._parse_evaluation_response(response_text)
            
            return analysis_result, response_text
        
        except Exception as e:
            return {"error": str(e)}, ""
    
    def generate_portfolio_feedback(
        self,
        student_name: str,
        all_artifacts: Dict[str, list]
    ) -> Tuple[str, str]:
        """
        포트폴리오 전체에 대한 종합 피드백 생성
        
        Args:
            student_name: 학생 이름
            all_artifacts: {"p1": [...], "p2": [...], ...}
        
        Returns:
            (종합 피드백, API 응답 원문)
        """
        system_prompt = """당신은 교육 평가 전문가입니다. 학생의 전체 포트폴리오를 종합적으로 평가합니다.

【평가 원칙】
1. 7가지 실천 활동을 통해 드러난 학생의 역량을 통합적으로 본다
2. AI 활용 능력, 비판적 사고, 자기 성찰의 성장을 강조한다
3. 구체적이고 격려적인 피드백을 제공한다
4. 한국어로 작성한다"""
        
        artifacts_summary = ""
        for practice_key, artifacts in all_artifacts.items():
            artifacts_summary += f"\n【{practice_key}】\n"
            for i, artifact in enumerate(artifacts, 1):
                artifacts_summary += f"- 산출물 {i}: {artifact.get('raw_text', '')[:200]}...\n"
        
        user_prompt = f"""다음 학생의 전체 포트폴리오를 평가해주세요:

{artifacts_summary}

이 포트폴리오를 통해 드러난 학생의 역량, 성장, 강점을 종합적으로 평가하고 피드백을 제공해주세요."""
        
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=3000,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            response_text = response.content[0].text
            return response_text, response_text
        
        except Exception as e:
            return f"오류: {str(e)}", ""
