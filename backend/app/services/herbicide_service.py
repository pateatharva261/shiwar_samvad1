HERBICIDE_DATA: dict[str, dict[str, str | list[str]]] = {
    "Chinee apple": {
        "scientific": "Ziziphus mauritiana",
        "herbicides": ["Triclopyr", "Fluroxypyr", "Picloram"],
    },
    "Snake weed": {
        "scientific": "Stachytarpheta spp.",
        "herbicides": ["Glyphosate", "2,4-D"],
    },
    "Lantana": {
        "scientific": "Lantana camara",
        "herbicides": ["Fluroxypyr", "Aminocyclopyrachlor"],
    },
    "Prickly acacia": {
        "scientific": "Vachellia nilotica",
        "herbicides": ["Fluroxypyr", "Triclopyr + Picloram"],
    },
    "Siam weed": {
        "scientific": "Chromolaena odorata",
        "herbicides": ["Fluroxypyr", "Triclopyr + Picloram"],
    },
    "Parthenium": {
        "scientific": "Parthenium hysterophorus",
        "herbicides": ["Glyphosate", "2,4-D"],
    },
    "Rubber vine": {
        "scientific": "Cryptostegia grandiflora",
        "herbicides": ["Triclopyr + Picloram", "Triclopyr (Garlon 600)"],
    },
    "Parkinsonia": {
        "scientific": "Parkinsonia aculeata",
        "herbicides": ["Fluroxypyr", "Triclopyr + Picloram"],
    },
}


def get_herbicide_details(species_name: str) -> dict:
    if not species_name or species_name.lower() in {"non-weed", "negative"}:
        return {
            "found": False,
            "species": species_name or "Unknown",
            "message": "No herbicide recommendation is needed for non-weed images.",
            "herbicides": [],
            "usage_instructions": [],
            "safety_precautions": [],
            "application_method": "",
        }

    details = HERBICIDE_DATA.get(species_name)
    if not details:
        return {
            "found": False,
            "species": species_name,
            "message": "No recommendation found",
            "herbicides": [],
            "usage_instructions": [],
            "safety_precautions": [],
            "application_method": "",
        }

    herbicides = details["herbicides"]
    return {
        "found": True,
        "species": species_name,
        "scientific": details["scientific"],
        "herbicides": herbicides,
        "herbicide_text": ", ".join(herbicides),
        "usage_instructions": [
            "Confirm weed identity and crop compatibility before spraying.",
            "Apply only on actively growing weeds for better uptake.",
            "Avoid spraying during strong wind, heavy rain risk, or heat stress.",
        ],
        "safety_precautions": [
            "Wear gloves, mask, eye protection, long sleeves, and closed footwear.",
            "Follow the herbicide label and local agricultural guidance.",
            "Keep children, animals, and uncovered water sources away from spray drift.",
        ],
        "application_method": "Use calibrated spot spray or directed spray equipment. Cover weed foliage evenly without runoff.",
    }
