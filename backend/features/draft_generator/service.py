def generate_draft(data):
    name = data.get("name", "N/A")
    date = data.get("date", "N/A")
    location = data.get("location", "N/A")
    description = data.get("description", "N/A")
    draft_type = data.get("type", "fir")  # default FIR

    # Smart subject detection
    subject = "Complaint regarding incident"

    if "stolen" in description.lower() or "theft" in description.lower():
        subject = "Complaint regarding theft"
    elif "fraud" in description.lower() or "scam" in description.lower():
        subject = "Complaint regarding fraud"
    elif "harass" in description.lower():
        subject = "Complaint regarding harassment"

    # Different draft types
    if draft_type == "fir":
        draft = f"""
To,
The Station House Officer,
[Police Station Name]

Subject: {subject}

Respected Sir/Madam,

I, {name}, would like to report that on {date}, at {location}, the following incident occurred:

{description}

This incident has caused me inconvenience and I request you to kindly take necessary legal action at the earliest.

I am willing to cooperate fully with the investigation.

Thanking you.

Yours sincerely,  
{name}
"""

    elif draft_type == "complaint":
        draft = f"""
Subject: Formal Complaint

I, {name}, am writing to formally complain about an incident that occurred on {date} at {location}.

{description}

I request appropriate action to be taken at the earliest.

Sincerely,  
{name}
"""

    elif draft_type == "notice":
        draft = f"""
LEGAL NOTICE

Date: {date}

To Whom It May Concern,

This is to notify that the following issue has been brought to attention:

{description}

Failure to address this matter may result in legal action.

Regards,  
{name}
"""

    else:
        draft = "Invalid draft type selected."

    return {"draft": draft}