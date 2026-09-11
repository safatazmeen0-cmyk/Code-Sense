import json
from pathlib import Path


RECOMMENDATIONS_PATH = Path(__file__).with_name("recommendations.json")


def load_recommendations():
    with RECOMMENDATIONS_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_recommendation(category):
    recommendations = load_recommendations()
    return recommendations.get(category, recommendations["Runtime Error"])