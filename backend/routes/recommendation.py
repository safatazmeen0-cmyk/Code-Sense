from flask import Blueprint, jsonify

from recommendation.concept_mapping import get_recommendation


recommendation_bp = Blueprint("recommendation", __name__)


@recommendation_bp.get("/recommendation/<category>")
def recommendation(category):
    normalized = category.replace("-", " ").replace("_", " ").title()
    return jsonify({"success": True, "recommendation": get_recommendation(normalized)})