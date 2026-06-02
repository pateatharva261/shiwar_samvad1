from backend.app.services.herbicide_service import get_herbicide_details


SEVERITY_MULTIPLIER = {"Low": 0.75, "Medium": 1.0, "High": 1.25}
WEATHER_MULTIPLIER = {
    "dry": 0.95,
    "sunny": 1.0,
    "humid": 1.05,
    "cloudy": 1.0,
    "windy": 0.9,
    "rainy": 0.0,
}
HERBICIDE_PRICE_PER_LITER = {
    "Glyphosate": 520,
    "2,4-D": 380,
    "Triclopyr": 920,
    "Fluroxypyr": 870,
    "Picloram": 1050,
    "Aminocyclopyrachlor": 1200,
    "Triclopyr + Picloram": 980,
    "Triclopyr (Garlon 600)": 1100,
}


def _weather_factor(weather: str) -> float:
    text = weather.lower()
    for key, value in WEATHER_MULTIPLIER.items():
        if key in text:
            return value
    return 1.0


def build_dosage_recommendation(payload) -> dict:
    herbicide = get_herbicide_details(payload.weed_type)
    base_liters_per_acre = 1.2
    severity_factor = SEVERITY_MULTIPLIER[payload.severity]
    weather_factor = _weather_factor(payload.weather)
    total_liters = round(base_liters_per_acre * payload.land_area * severity_factor * weather_factor, 2)
    water_liters = round(payload.land_area * 180, 1)

    if weather_factor == 0:
        spray = "Do not spray now. Rain can wash herbicide away and reduce control."
    elif "wind" in payload.weather.lower():
        spray = "Delay until wind is calm, or use low-drift nozzle and directed spraying."
    else:
        spray = "Spray in early morning or late afternoon with even leaf coverage."

    return {
        "weed_type": payload.weed_type,
        "crop_type": payload.crop_type,
        "land_area": payload.land_area,
        "recommended_herbicides": herbicide.get("herbicides", []),
        "safe_dosage_liters": total_liters,
        "water_volume_liters": water_liters,
        "spray_recommendation": spray,
        "precautions": [
            "Use this as a planning estimate and verify the product label before mixing.",
            "Test a small area if the crop is sensitive or recently stressed.",
            "Maintain buffer distance near wells, ponds, and neighboring crops.",
        ],
        "application_timing": payload.application_timing,
    }


def build_cost_estimate(payload) -> dict:
    herbicide = payload.herbicide_type
    price = HERBICIDE_PRICE_PER_LITER.get(herbicide, 750)
    weather_factor = _weather_factor(payload.weather)
    quantity = round(max(weather_factor, 0.8) * payload.land_area * 1.2, 2)
    product_cost = round(quantity * price, 2)
    labor_cost = round(payload.land_area * 250, 2)
    equipment_cost = round(payload.land_area * 80, 2)
    total = round(product_cost + labor_cost + equipment_cost, 2)
    return {
        "crop_type": payload.crop_type,
        "herbicide_type": herbicide,
        "quantity_required_liters": quantity,
        "estimated_product_cost": product_cost,
        "labor_cost": labor_cost,
        "equipment_cost": equipment_cost,
        "total_estimated_cost": total,
        "cost_breakdown": [
            {"label": "Herbicide product", "amount": product_cost},
            {"label": "Labor and field preparation", "amount": labor_cost},
            {"label": "Sprayer/equipment allowance", "amount": equipment_cost},
        ],
        "expense_summary": f"Estimated cost for {payload.land_area} acres is INR {total}.",
    }
