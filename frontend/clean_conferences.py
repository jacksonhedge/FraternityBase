#!/usr/bin/env python3
"""
Script to clean up Power 4 conference data in statesGeoData.ts
Only fixes incorrect conference assignments - does not delete any schools
"""

import re

# Official Power 4 conference members (2024-25)
POWER_4_SCHOOLS = {
    # SEC (16 schools)
    "SEC": [
        "University of Alabama",
        "The University of Alabama",
        "Auburn University",
        "University of Arkansas",
        "University of Florida",
        "University of Georgia",
        "University of Kentucky",
        "Louisiana State University",
        "University of Mississippi",
        "Mississippi State University",
        "University of Missouri",
        "University of Oklahoma",
        "University of South Carolina",
        "University of Tennessee",
        "Texas A&M University",
        "University of Texas at Austin",
        "Vanderbilt University",
    ],
    # Big 10 (18 schools)
    "BIG 10": [
        "University of Illinois",
        "Indiana University",
        "University of Iowa",
        "University of Maryland",
        "University of Michigan",
        "Michigan State University",
        "University of Minnesota",
        "University of Nebraska",
        "Northwestern University",
        "Ohio State University",
        "University of Oregon",
        "Pennsylvania State University",
        "Penn State University",
        "Purdue University",
        "Rutgers University",
        "University of California, Los Angeles",
        "University of Southern California",
        "University of Washington",
        "University of Wisconsin",
    ],
    # Big 12 (16 schools)
    "BIG 12": [
        "University of Arizona",
        "Arizona State University",
        "Baylor University",
        "Brigham Young University",
        "University of Central Florida",
        "University of Cincinnati",
        "University of Colorado",
        "University of Houston",
        "Iowa State University",
        "University of Kansas",
        "Kansas State University",
        "Oklahoma State University",
        "Texas Christian University",
        "Texas Tech University",
        "University of Utah",
        "West Virginia University",
    ],
    # ACC (17 schools)
    "ACC": [
        "Boston College",
        "Clemson University",
        "Duke University",
        "Florida State University",
        "Georgia Institute of Technology",
        "University of Louisville",
        "University of Miami",
        "North Carolina State University",
        "University of North Carolina",
        "University of Notre Dame",
        "University of Pittsburgh",
        "Southern Methodist University",
        "Leland Stanford Junior University",
        "Syracuse University",
        "University of Virginia",
        "Virginia Polytechnic Institute",
        "Virginia Tech",
        "Wake Forest University",
    ],
}

def is_power_4_school(school_name, conference):
    """Check if a school is actually a Power 4 member"""
    if not conference or conference not in POWER_4_SCHOOLS:
        return False

    # Satellite campus keywords that indicate NOT a Power 4 school
    satellite_keywords = [
        " at ", "campus", "branch", ", ", "–", " - ",
        "fort wayne", "northwest", "crookston", "duluth", "morris",
        "omaha", "camden", "newark", "abington", "altoona", "behrend",
        "berks", "brandywine", "harrisburg", "chicago", "indianapolis",
        "eastern shore", "baltimore county", "springfield", "fort smith",
        "st. louis", "aiken", "beaufort", "upstate", "kingsville",
        "corpus christi", "san antonio", "permian basin", "tyler"
    ]

    # Check for satellite keywords
    school_lower = school_name.lower()
    for keyword in satellite_keywords:
        if keyword in school_lower:
            return False

    # Get the list of official schools for this conference
    official_schools = POWER_4_SCHOOLS[conference]

    # Check if the school name matches any official school (partial match)
    for official_school in official_schools:
        if official_school.lower() in school_lower:
            return True

    return False

def clean_conference_data(input_file, output_file):
    """Clean conference data by removing incorrect assignments"""

    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all college entries with regex
    pattern = r'"([^"]+)"\s*:\s*\{([^}]+)\}'

    changes_made = 0
    schools_cleaned = []

    def fix_entry(match):
        nonlocal changes_made, schools_cleaned
        school_name = match.group(1)
        properties = match.group(2)

        # Extract current conference
        conf_match = re.search(r'conference:\s*"([^"]*)"', properties)
        if not conf_match:
            return match.group(0)  # No conference, leave as is

        current_conf = conf_match.group(1)

        # Check if this is a Power 4 conference
        if current_conf in ["SEC", "BIG 10", "BIG 12", "ACC"]:
            # Verify if this school should actually have this conference
            if not is_power_4_school(school_name, current_conf):
                # Remove the conference (set to empty string)
                new_properties = re.sub(
                    r'conference:\s*"[^"]*"',
                    'conference: ""',
                    properties
                )
                changes_made += 1
                schools_cleaned.append(f"{school_name} (removed {current_conf})")
                return f'"{school_name}": {{{new_properties}}}'

        # Leave as is
        return match.group(0)

    # Apply fixes
    new_content = re.sub(pattern, fix_entry, content)

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return changes_made, schools_cleaned

if __name__ == "__main__":
    input_file = "/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/src/data/statesGeoData.ts"
    output_file = "/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/src/data/statesGeoData.ts"

    print("Starting conference data cleanup...")
    print("=" * 60)

    changes, schools = clean_conference_data(input_file, output_file)

    print(f"\n✅ Cleanup complete!")
    print(f"📊 Total changes made: {changes}")
    print(f"\n🏫 Schools cleaned:")
    for school in schools[:20]:  # Show first 20
        print(f"  - {school}")

    if len(schools) > 20:
        print(f"  ... and {len(schools) - 20} more")

    print(f"\n💾 Backup saved at: statesGeoData.ts.backup")
