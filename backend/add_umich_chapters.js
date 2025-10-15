const API_URL = 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = '***REMOVED***';

// IFC Fraternities
const fraternities = [
  { org: 'Alpha Delta Phi', president: 'Alex Melchior', email: 'alexmel@umich.edu', address: '556 S. State' },
  { org: 'Alpha Sigma Phi', president: 'Ethan Levine', email: 'ejlevine@umich.edu', address: '640 Oxford' },
  { org: 'Chi Phi', president: 'Cam Amiot', email: 'rcamiot@umich.edu', address: 'FSL - 1443 Washtenaw Ave.' },
  { org: 'Delta Chi', president: 'Eli Germain', email: 'egermain@umich.edu', address: '1705 Hill Street' },
  { org: 'Delta Sigma Phi', president: 'Sam Howe', email: 'samhowe@umich.edu', address: 'FSL - 1443 Washtenaw Ave.' },
  { org: 'Delta Tau Delta', president: 'Nate Kocik', email: 'Nkocik@umich.edu', address: '1928 Geddes' },
  { org: 'Kappa Sigma', president: 'Joseph Stopczynski', email: 'egermain@umich.edu', address: '806 Hill' },
  { org: 'Lambda Chi Alpha', president: 'Ethan Miller', email: 'ethanqm@umich.edu', address: '1601 Washtenaw' },
  { org: 'Phi Delta Theta', president: 'Sean McDonnell', email: 'mcdsean@umich.edu', address: '1437 Washtenaw' },
  { org: 'Phi Gamma Delta', president: 'Aaron Grekowicz', email: 'aarongre@umich.edu', address: '707 Oxford' },
  { org: 'Pi Kappa Alpha', president: 'Grant Schleiter', email: 'Gschleit@umich.edu', address: '1004 Olivia' },
  { org: 'Psi Upsilon', president: 'Ashton Clark', email: 'ashbc@umich.edu', address: '1000 Hill' },
  { org: 'Sigma Alpha Epsilon', president: 'William Gardner', email: 'wgard@umich.edu', address: '1408 Washtenaw' },
  { org: 'Sigma Alpha Mu', president: 'Eli Rosenblatt', email: 'elir@umich.edu', address: '800 Oxford' },
  { org: 'Sigma Chi', president: 'Tyloer Werner', email: 'tywer@umich.edu', address: '548 S. State' },
  { org: 'Sigma Nu', president: 'Bobby Gardner', email: 'rgardne@umich.edu', address: '700 Oxford' },
  { org: 'Sigma Phi Epsilon', president: 'Matt Erickson', email: 'erickmat@umich.edu', address: '920 Baldwin' },
  { org: 'Tau Kappa Epsilon', president: 'Pat Blomberg', email: 'pblom@umich.edu', address: '1415 Cambridge' },
  { org: 'Theta Delta Chi', president: 'Dawson Sharpley', email: 'dawssh@umich.edu', address: '700 S. State' },
  { org: 'Theta Xi', president: 'Jackson Temple', email: 'jacktemp@umich.edu', address: '1345 Washtenaw' },
  { org: 'Triangle', president: 'Will Eubank', email: 'wilceub@umich.edu', address: '1501 Washtenaw' },
  { org: 'Zeta Beta Tau', president: 'Julian Albright', email: 'jalbright@zbtnational.org', address: 'FSL - 1443 Washtenaw Ave.' }
];

// Panhel Sororities
const sororities = [
  { org: 'Alpha Chi Omega', president: 'Audrey Parker', email: 'audpark@umich.edu', address: '1212 Hill Street' },
  { org: 'Alpha Delta Pi', president: 'Alexa Crociata', email: 'alexacro@umich.edu', address: '722 S. Forest' },
  { org: 'Alpha Epsilon Phi', president: 'Sydney Leibowitz', email: 'sleibo@umich.edu', address: '1205 Hill Street' },
  { org: 'Alpha Gamma Delta', president: 'Maddie Wheeler', email: 'maddiewh@umich.edu', address: '1322 Hill Street' },
  { org: 'Alpha Phi', president: 'Cathryn Stonisch', email: 'stonisch@umich.edu', address: '1830 Hill Street' },
  { org: 'Chi Omega', president: 'Ella Morgades', email: 'ellamor@umich.edu', address: '1525 Washtenaw Ave' },
  { org: 'Delta Delta Delta', president: 'Emma Whitley', email: 'lscaife@umich.edu', address: '718 Tappan' },
  { org: 'Delta Gamma', president: 'Audrey Lee', email: 'leeaud@umich.edu', address: '626 Oxford' },
  { org: 'Delta Phi Epsilon', president: 'Sophia Diaz', email: 'sophiadi@umich.edu', address: '1414 Washtenaw' },
  { org: 'Gamma Phi Beta', president: 'Ann Pomeroy', email: 'apomeroy@umich.edu', address: '1520 S. University' },
  { org: 'Kappa Delta', president: 'Maya Maurice', email: 'mayama@umich.edu', address: '730 Tappan' },
  { org: 'Kappa Kappa Gamma', president: 'Miranda Jefferds', email: 'miranj@umich.edu', address: '1204 Hill Street' },
  { org: 'Phi Sigma Rho', president: 'Ashley Drzewicki', email: 'adrzewic@umich.edu', address: 'FSL - 1443 Washtenaw Ave.' },
  { org: 'Pi Beta Phi', president: 'Jolie Oleshansky', email: 'jolieo@umich.edu', address: '836 Tappan' },
  { org: 'Sigma Delta Tau', president: 'Dylan Bass', email: 'dylanbas@umich.edu', address: '1405 Hill Street' },
  { org: 'Sigma Kappa', president: 'Wallis Kelleher-Ferguson', email: 'walliskf@umich.edu', address: '1811 Washtenaw Ave' },
  { org: 'Zeta Tau Alpha', president: 'Ellison Everhart', email: 'ellieev@umich.edu', address: '1550 Washtenaw' }
];

const allChapters = [...fraternities, ...sororities];

async function addUMichChapters() {
  const results = {
    created: [],
    existing: [],
    failed: []
  };

  console.log(`🎓 Adding ${allChapters.length} chapters to University of Michigan...`);
  console.log(`  - ${fraternities.length} IFC fraternities`);
  console.log(`  - ${sororities.length} Panhel sororities\n`);

  for (const chapter of allChapters) {
    try {
      console.log(`📝 Creating ${chapter.org} at Michigan...`);

      const chapterData = {
        organization_name: chapter.org,
        university_name: 'University of Michigan',
        grade: 4.5,
        is_viewable: true,
        status: 'active'
      };

      if (chapter.address) {
        chapterData.address = chapter.address;
      }

      const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify(chapterData)
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`✅ Created chapter: ${data.data.id}`);
        const chapterId = data.data.id;
        results.created.push({ org: chapter.org, id: chapterId });

        // Add president
        if (chapter.president && chapter.email) {
          console.log(`  👤 Adding president: ${chapter.president}...`);

          const officerRes = await fetch(`${API_URL}/admin/officers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': ADMIN_TOKEN
            },
            body: JSON.stringify({
              chapter_id: chapterId,
              name: chapter.president,
              position: 'President',
              email: chapter.email,
              member_type: 'officer',
              is_primary_contact: true
            })
          });

          const officerData = await officerRes.json();
          if (officerRes.ok) {
            console.log(`  ✅ Added president`);
          } else {
            console.log(`  ⚠️  Failed to add president: ${officerData.error}`);
          }
        }

      } else if (data.existing_chapter) {
        console.log(`ℹ️  Already exists: ${data.existing_chapter.id}`);
        results.existing.push({ org: chapter.org, id: data.existing_chapter.id });
      } else {
        console.log(`❌ Error: ${data.error}`);
        results.failed.push({ org: chapter.org, error: data.error });
      }

    } catch (error) {
      console.error(`❌ Fatal error for ${chapter.org}:`, error.message);
      results.failed.push({ org: chapter.org, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`ℹ️  Already existed: ${results.existing.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('='.repeat(60));

  if (results.failed.length > 0) {
    console.log('\n❌ Failed chapters:');
    results.failed.forEach(f => {
      console.log(`  - ${f.org}: ${f.error}`);
    });
  }

  console.log('\n✨ University of Michigan complete!');
}

addUMichChapters();
