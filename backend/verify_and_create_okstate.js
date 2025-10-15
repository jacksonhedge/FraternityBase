const API_URL = 'https://backend-gir2kat8a-jackson-fitzgeralds-projects.vercel.app/api';
const ADMIN_TOKEN = '***REMOVED***';

async function verifyAndCreate() {
  try {
    console.log('🔍 Searching for existing Sigma Chi at Oklahoma State...');

    // Get all chapters
    const chaptersRes = await fetch(`${API_URL}/admin/chapters`, {
      headers: { 'x-admin-token': ADMIN_TOKEN }
    });
    const chaptersData = await chaptersRes.json();

    // Find Sigma Chi at Oklahoma State
    const existingChapter = chaptersData.data.find(ch =>
      ch.greek_organizations?.name === 'Sigma Chi' &&
      ch.universities?.name?.includes('Oklahoma State')
    );

    if (existingChapter) {
      console.log('✅ Found existing chapter:', {
        id: existingChapter.id,
        chapter_name: existingChapter.chapter_name,
        university: existingChapter.universities?.name,
        grade: existingChapter.grade,
        is_viewable: existingChapter.is_viewable,
        member_count: existingChapter.member_count
      });
      return existingChapter;
    }

    console.log('❌ Chapter not found. Creating new one...');

    // Create the chapter using Quick Add
    const createRes = await fetch(`${API_URL}/admin/chapters/quick-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        organization_name: 'Sigma Chi',
        university_name: 'Oklahoma State',
        grade: 5.0,
        is_viewable: true,
        status: 'active'
      })
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      console.error('❌ Error creating chapter:', createData.error);
      return null;
    }

    console.log('✅ Chapter created:', createData.data.id);

    // Upload roster
    console.log('📋 Uploading roster...');

    const rosterCSV = `name,email,phone,member_type,position
William Charles Jackson,wcharlesjackson243@gmail.com,(816) 859-6730,member,
Nicholas Joseph O'Kain,nicholasokain@gmail.com,(816) 835-4090,member,
Grant Lane Boffeli,grantboffeli@gmail.com,(985) 590-1127,member,
Vince Robert Pino,vrp0901@gmail.com,(714) 585-1105,member,
Jace Michael Goodman,jacegoodman01@gmail.com,(317) 502-3337,member,
Laython Burkheart,laythonbhrt@gmail.com,(763) 263-3237,member,
Nicholas Patrick Bussey,nickbussey2@gmail.com,(918) 749-1239,member,
Kyle Jonard Bussey,kylebussey06@gmail.com,(918) 749-0259,member,
Brody Baylon,brodybaylon@gmail.com,(702) 630-7360,member,
Thomas Ryan Burford,thomasburford2004@gmail.com,,member,
Easton Holmer Coleman,east.eas3176@gmail.com,(817) 502-5332,member,
Andrew Hunter Crittenden,huntercrittenden5@gmail.com,(580) 736-1992,member,
Tanner John DeVries,tannerdevries03@gmail.com,(405) 885-1433,member,
Blake James Davison,blakegraydavison0@gmail.com,(918) 638-0837,member,
Wyatt Cole Grayson,wcolegrayson@gmail.com,(405) 833-6443,member,
Braden Michael Flynn,bradenflynn6@gmail.com,(214) 207-9424,member,
Jack Joseph Kelly,jackjkelly6@gmail.com,,member,
Bill Meuser Humphrey,bfhump49@outlook.com,(541) 740-7674,member,
Cade Hamilton Henry,cadehenry01@gmail.com,(580) 481-2291,member,
Koen Cameron Huseman,koenhuseman@gmail.com,(918) 809-0180,member,
Peyton Wyatt Isaacson,peytonisaacson@gmail.com,(405) 517-5010,member,
Kyle Wayne Keyes,kwkeyes@gmail.com,(405) 799-3896,member,
Graham Duane Kimmi,gkimmi@gmail.com,(580) 641-8259,member,
Luke Garrison Lile,lukelile07@gmail.com,,member,
Austin Wade Lancaster,austinwlancaster03@gmail.com,(918) 527-6857,member,
Dylan Michael McBride,dylanmichael121@gmail.com,,member,
Alexander Francis Maher,alexmaher13@gmail.com,(405) 412-9960,member,
Ben Tyler Manias,benmanias@icloud.com,(405) 464-6418,member,
Kaiden Neel Miller,kaidenmiller2005@gmail.com,(618) 304-9246,member,
Samuel Jack Moss,sammoss062@gmail.com,(479) 445-1218,member,
Maxwell Ivan Millard,mmillard2002@gmail.com,(918) 360-3622,member,
Ryan Thomas Pinchback,rtp0084@gmail.com,(405) 760-4868,member,
William John Patton,willpatton04@gmail.com,,member,
Trae Julian Plank,traeplank@gmail.com,(405) 397-5606,member,
Ryan Patrick Plunkett,ryanplunkett2004@gmail.com,(918) 978-8502,member,
Jared Phillip Poolaw,jaredpoolaw@gmail.com,(580) 678-6888,member,
Harrison Tyler Peck,harrisonpeck2004@gmail.com,(405) 820-5137,member,
Marshall Justin Spencer,mspencer02004@gmail.com,(405) 567-4813,member,
Luke Francis White,ldwhite2@okstate.edu,(816) 210-0717,member,
Jake Aubien White,jake.white09@icloud.com,(316) 619-5967,member,
Wesley Daniel Waldorf,wwaldorf@gmail.com,(785) 760-5954,member,
Jacob Wade Whipple,jacobwade123@gmail.com,,member,
Ryan Patrick Young,ryanyoung0327@gmail.com,(405) 306-1308,member,
Conlin Brock Wade,cbwade@gmail.com,(405) 202-5467,member,
Hayden Garrett Wulf,haydenwulf04@gmail.com,(405) 928-9930,member,
Blaine Walter Kouri,blainekouri@gmail.com,(405) 923-5397,member,
Zac Clayton Henley,zachenley779@gmail.com,(405) 314-5435,member,
Reece McCoy Sparks,reecesparks0@gmail.com,(405) 833-4700,member,
Cooper James Smith,coopersmith0502@gmail.com,(817) 566-7315,member,
Jayden Austin Holder,jasholder@okstate.edu,(405) 339-8968,member,
Caden Andrew Foster,caden.foster36@gmail.com,(918) 633-6783,member,
Hayden John Montaño,haydenjmont@gmail.com,(714) 822-3350,member,
Jackson Michael Burrill,jburrill1@okstate.edu,(815) 621-6422,member,
Luke Andrew Harrison,lharrison@okstate.edu,(918) 369-1869,member,
Sean Terrence Martinez,smartinez26@okstate.edu,(405) 623-3904,member,
Joshua Aaron Young,jyoung27@okstate.edu,(405) 473-6051,member,
Jack William Fisher,jackfisher@icloud.com,(918) 809-8713,member,
Joseph Mathew Barrientes,jbarrientes@okstate.edu,(214) 789-4255,member,
Tyler Thomas Harwell,tylerharwell04@gmail.com,(254) 716-6787,member,
Tyler Andrew Thomas,tylerthomas2602@gmail.com,(405) 464-4157,member,
Caleb Jamison Norris,calebnorris1904@gmail.com,(405) 590-1275,member,
Jack Ryan Rooney,jackrooney04@gmail.com,(918) 519-8010,member,
Kody Ray Wilcox,kodywilcox@gmail.com,(918) 931-8513,member,
Conner Samuel Potlacheff,csp0103@gmail.com,(918) 260-3622,member,
Wyatt Matthew Doan,wyatdoan@gmail.com,(918) 991-3340,member,
Ethan Gregory Haney,ethanhaney10@gmail.com,9042834295,member,
Riley Joseph Dixon,rileydixon08@gmail.com,(918) 740-8561,member,
Mason Thomas Hicks,mhicks04@okstate.edu,,member,
Elijah Nathaniel Ellis,elijahellis2005@gmail.com,,member,
Hayden Michael Woolery,hayden.woolery@icloud.com,9409029643,member,
Brett Preston Brimberry,brimberry.brett2021@gmail.com,9404314515,member,
Christian Scott Lorentzen,christian.lorentzen04@gmail.com,,member,
Hunter Lee Baumann,hlr.sbaumann@gmail.com,4802895098,member,
Peyton Christopher Pogue,peytonpogue@gmail.com,9183859090,member,
Aidan Luca Berroteran,berrotbear@gmail.com,4807414928,member,
Isaac Theodore Roach,isaacroach23@gmail.com,9183911974,member,
Ethan Michael Bainbridge,ebainbridge@okstate.edu,9188482257,member,
Maxson Timothy Novotny,mnovotny@okstate.edu,,member,
Gavin Hunter Leech,gavinhleech@gmail.com,5807129560,member,
Jackson Bryant Hunt,jacksonhunt8@gmail.com,9188957941,member,
Andrew Finn Marohl,andrewmarohl@gmail.com,4055173228,member,
Nicholas Spencer Stringer,nickstringer@outlook.com,8173746818,member,
Elijah Blake Wink,bwink0706@gmail.com,4053014269,member,
Tatum Joseph Hayworth,tatumhayw@gmail.com,9188950516,member,
Ryan Eugene Spahr,ryanspahr15@gmail.com,9188918742,member,
Garrett Ryan Kocis,garrettkocis03@gmail.com,9729770239,member,
Gunner Andrew Zike,gunnerzike@gmail.com,5803049731,member,
Cason Jonah Baugh,casonbaugh@gmail.com,4059881171,member,
Riley Shane Frazier,rileyfraz@gmail.com,9182767793,member,
Cameron Andrew Evans,cameronevans03@gmail.com,4053028897,member,
Josh Avery Adair,joshadair0918@gmail.com,9189163199,member,
Eli Matthew Dale,elimdale@gmail.com,9182075809,member,
Nate Gene Allen,nateallen2@okstate.edu,4053267510,member,
Jase Robbin Hendren,jasehendren@gmail.com,4057615745,member,
Ryan Scott Moore,ryanmoore@okstate.edu,,member,
Zachary Austin Roseberry,zacroseberry@yahoo.com,4806810455,member,
Marcelino Santander Espinoza,marcelinosantanderespinoza@gmail.com,4808023239,member,
Jackson David King,jdking@okstate.edu,5053483853,member,
Chance Wesley King,chanceking@okstate.edu,4057781466,member,
Garrett Gene Ramsey,gramsey@okstate.edu,9187880260,member,
Connor Ryan Pryor,cpryor@okstate.edu,5804701069,member,
Beau Tyler Whiteside,beauwhiteside@gmail.com,9183148084,member,
Riley Robert Denbow,rileydenbow@gmail.com,9182053970,member,
Brady James Alfred,bradyalfred@icloud.com,4327410860,member,
Jarrott Donovan Baker,jdbaker@okstate.edu,,member,
Easton Carleton Akins,eastonakins@icloud.com,8177592812,member,
Ethan Caleb Bainbridge,ethanbainbridge04@gmail.com,9188901524,member,
Anderson Jack Dickey,jack_dickey@icloud.com,9188542307,member,
Gray Wesley Gray,graywgray@gmail.com,,member,
Auston Michael Dean,adean@okstate.edu,9184807012,member,
Colton Joseph Harrison,cjharrison@okstate.edu,9187317194,member,
Charles Mackenzie Christy,charliechristy05@gmail.com,9183741186,member,
Samuel Raymond Greason,samgreason@icloud.com,8052614906,member,
Talan Tyler Hayworth,hayworth5t@gmail.com,9188950415,member,
Ethan Joseph Morris,morose0906@gmail.com,9189178017,member,
Benjamin Carter Bunn,bbunn@okstate.edu,9405317321,member,
Noah Christopher Irvin,noahirvin29@gmail.com,4053352653,member,
Chase Michael Smith,chasmitty@gmail.com,9185123210,member,
John Alexander Moody IV,moodyja00@gmail.com,4806743246,member,
Tucker Blake Phillips,tbphillips@okstate.edu,,member,
Benjamin Michael Pruitt,benmpruitt@gmail.com,,member,
Brock Allen Wilson,brock.wilson2004@gmail.com,9185134268,member,
Carson James Baugh,carsonbaugh10@gmail.com,4059888169,member,
Ethan Michael Duvall,edmichael1006@gmail.com,9188095393,member,
Tyler Jake Harwell,tjharwell@okstate.edu,2547166787,member,
Emmanuel Randell Saro,esaro@okstate.edu,9189018665,member,
Cooper James Savola,coopersavola04@gmail.com,9073917462,member,
Kolten Wade Merritt,kmerritt@okstate.edu,9183474536,member,
Braden Allen Braun,braden6197@icloud.com,8109650117,member,
Addison Lee Brown,alb56693@gmail.com,9405101511,member,
Luke Dean Vanzant,lukevanzant22@gmail.com,4053162745,member,
Zander Jacob Brooks,zanderbrooks14@gmail.com,4059882353,member,
Branson Glenn Brunkhorst,bbrunkhorst@okstate.edu,4057113296,member,`;

    const rosterRes = await fetch(`${API_URL}/admin/chapters/${createData.data.id}/paste-roster`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({ csvText: rosterCSV })
    });

    const rosterData = await rosterRes.json();

    if (!rosterRes.ok) {
      console.error('❌ Error uploading roster:', rosterData.error);
    } else {
      console.log('✅ Roster uploaded successfully!');
      console.log(`   Inserted: ${rosterData.insertedCount}`);
      console.log(`   Updated: ${rosterData.updatedCount}`);
      console.log(`   Skipped: ${rosterData.skippedCount}`);
    }

    return createData.data;

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

verifyAndCreate();
