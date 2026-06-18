/* =====================================================================
   TOEFL Writing 添削講座 — Build a Sentence 問題データ
   12 セット × 10 問。各問は本番準拠（全語が正しい位置で正解＝all-or-nothing）。
   フィールド:
     g = 話者アバター ('female' | 'male')   ※見た目のみ
     p = prompt（画面に出る相手の発話）
     s = fixedStart（固定の文頭。空文字可）
     e = fixedEnd（固定の文末。空文字可）
     a = answer（正しい語順。この配列をシャッフルして語群として提示）
     alt = altAnswers（許容する別解。任意。例: 副詞位置の入替）
   問題を追加・編集する場合はこのファイルだけを直せばOK。
   ===================================================================== */
const BAS_SETS = [
  { set:1, theme:"Directions & Everyday Requests", items:[
    {g:"female",p:"Excuse me, could you tell me how to get to the museum?",s:"Sure,",e:"on your left.",a:["just","walk","straight","ahead","for","two blocks","and you'll see it"]},
    {g:"male",p:"Do you know if there's a bank around here?",s:"Yes,",e:"the post office.",a:["there's","one","right","across","from"]},
    {g:"female",p:"What's the fastest way to reach the airport?",s:"Honestly,",e:"the express train.",a:["the","quickest","option","is","to","take"]},
    {g:"male",p:"Should I turn left at the next corner?",s:"No,",e:"the second light.",a:["you'll","need","to","turn","right","at"]},
    {g:"female",p:"Is the pharmacy still open at this hour?",s:"I think",e:"nine.",a:["it","usually","closes","sometime","around"]},
    {g:"male",p:"How far is the stadium from here?",s:"It's",e:"on foot.",a:["only","about","ten","minutes","away"]},
    {g:"female",p:"Can I get to the beach by bus?",s:"Yes,",e:"the city center.",a:["the","number","forty","bus","leaves","from"]},
    {g:"male",p:"Where can I find a good map of the area?",s:"You",e:"the information desk.",a:["can","pick","one","up","for free","at"]},
    {g:"female",p:"Is this the right road to the national park?",s:"Actually,",e:"a mile back.",a:["you","probably","missed","the","turn","about"]},
    {g:"male",p:"Could you recommend a quiet place to sit and read?",s:"There's",e:"the library.",a:["a","peaceful","garden","just","behind"]}
  ]},
  { set:2, theme:"Campus & Classes", items:[
    {g:"female",p:"Did you understand today's lecture on economics?",s:"Mostly,",e:"the last part.",a:["though","I","got","a little","lost","during"]},
    {g:"male",p:"Have you chosen your courses for next semester yet?",s:"Not yet,",e:"my advisor first.",a:["I","really","want","to","talk","with"]},
    {g:"female",p:"Why do you always sit in the front row?",s:"Because",e:"the board clearly.",a:["it","helps","me","focus","and","see"]},
    {g:"male",p:"Are you going to the career workshop on Friday?",s:"I'd like to,",e:"a class then.",a:["but","I","might","unfortunately","have"]},
    {g:"female",p:"How was the chemistry exam this morning?",s:"It was tough —",e:"the formulas.",a:["I","really","wish","I","had","memorized"]},
    {g:"male",p:"Do you prefer studying alone or in a group?",s:"I",e:"with others.",a:["usually","find","it","easier","to","study"]},
    {g:"female",p:"Did the professor extend the deadline for the essay?",s:"Yes,",e:"next Monday.",a:["she","very","kindly","moved","it","to"],alt:[["she","moved","it","very","kindly","to"]]},
    {g:"male",p:"What made you choose psychology as your major?",s:"I've",e:"human behavior.",a:["always","been","deeply","fascinated","by"]},
    {g:"female",p:"Can you explain what the assignment is about?",s:"Sure,",e:"a local issue.",a:["we","have","to","write","a short report","on","a"]},
    {g:"male",p:"Were you able to find the article in the library?",s:"Eventually,",e:"the help desk.",a:["but","only","after","asking","someone","at"]}
  ]},
  { set:3, theme:"Travel", items:[
    {g:"female",p:"Have you ever traveled outside your country?",s:"Yes,",e:"last summer.",a:["I","actually","visited","three","countries"]},
    {g:"male",p:"What do you usually pack for a long trip?",s:"I",e:"comfortable shoes.",a:["always","make","sure","to","bring"]},
    {g:"female",p:"Why did you decide to travel by train instead of flying?",s:"I",e:"the scenery.",a:["wanted","to","relax","and","enjoy","watching"]},
    {g:"male",p:"Did you have any trouble at the border?",s:"No,",e:"very smoothly.",a:["everything","actually","ended","up","going"]},
    {g:"female",p:"Where would you recommend staying in the city?",s:"There's",e:"the river.",a:["a","lovely","little","guesthouse","right","near"]},
    {g:"male",p:"How do you usually deal with jet lag?",s:"I",e:"the local time.",a:["try","to","adjust","quickly","to"]},
    {g:"female",p:"Was the museum worth visiting?",s:"Absolutely,",e:"the whole afternoon there.",a:["we","actually","ended","up","spending"]},
    {g:"male",p:"Did you book the hotel in advance?",s:"Yes,",e:"a better price.",a:["booking","early","really","helped","us","get"]},
    {g:"female",p:"What's the best souvenir you've ever bought?",s:"Probably",e:"a small market.",a:["a","handmade","silk","scarf","I","found","at"]},
    {g:"male",p:"Would you go back to that city again?",s:"Definitely,",e:"everything.",a:["I","sadly","didn't","get","to","see"]}
  ]},
  { set:4, theme:"Work & Jobs", items:[
    {g:"female",p:"How long have you been working at this company?",s:"I",e:"five years now.",a:["have","been","working","here","for","about"]},
    {g:"male",p:"Why are you interested in this position?",s:"I'm",e:"a creative team.",a:["really","excited","about","working","with"]},
    {g:"female",p:"Did the meeting go well this afternoon?",s:"It did,",e:"a few questions.",a:["although","my","boss","still","raised"]},
    {g:"male",p:"Can you finish the report by tomorrow?",s:"I",e:"a long night.",a:["should","probably","manage","but","it","might","be"]},
    {g:"female",p:"What do you enjoy most about your job?",s:"I",e:"every day.",a:["love","learning","something","new","here"]},
    {g:"male",p:"Have you ever thought about changing careers?",s:"I",e:"in education.",a:["have","seriously","thought","about","finding","work"]},
    {g:"female",p:"Did you get any feedback on your presentation?",s:"Yes,",e:"my delivery.",a:["my","manager","very","warmly","praised"]},
    {g:"male",p:"Why were you late to work this morning?",s:"My",e:"on the highway.",a:["train","was","delayed","because","of","an","accident"]},
    {g:"female",p:"Are you taking any time off this year?",s:"Yes,",e:"in August.",a:["I'm","planning","a","short","beach","trip"]},
    {g:"male",p:"How do you stay organized at work?",s:"I",e:"my tasks.",a:["use","a","simple","app","to","track"]}
  ]},
  { set:5, theme:"Food & Dining", items:[
    {g:"female",p:"What kind of food do you usually cook at home?",s:"I",e:"on weeknights.",a:["tend","to","make","simple","meals"]},
    {g:"male",p:"Have you tried the new restaurant downtown?",s:"Yes,",e:"the desserts.",a:["and","I","was","really","impressed","by"]},
    {g:"female",p:"Why don't you eat much meat?",s:"I",e:"more vegetables.",a:["decided","this","year","to","start","eating"]},
    {g:"male",p:"Can you recommend a good place for breakfast?",s:"There's",e:"the station.",a:["a","cozy","café","right","next","to"]},
    {g:"female",p:"Did you enjoy the dinner last night?",s:"I did,",e:"a bit too spicy.",a:["though","the","soup","was","unfortunately"]},
    {g:"male",p:"How do you usually make your coffee?",s:"I",e:"every morning.",a:["always","grind","the","beans","fresh"]},
    {g:"female",p:"Are you allergic to any foods?",s:"Yes,",e:"any nuts.",a:["I","unfortunately","have","to","strictly","avoid"]},
    {g:"male",p:"What's your favorite dish from your hometown?",s:"It's",e:"on special occasions.",a:["a","noodle","soup","that","we","always","eat"]},
    {g:"female",p:"Would you like to learn how to bake bread?",s:"Yes,",e:"for years.",a:["I've","actually","wanted","to","try","it"]},
    {g:"male",p:"Why do you prefer cooking to eating out?",s:"Because",e:"the ingredients.",a:["I","can","carefully","control","all"]}
  ]},
  { set:6, theme:"Hobbies & Free Time", items:[
    {g:"female",p:"What do you like to do on the weekends?",s:"I",e:"in the mountains.",a:["often","go","hiking","with","friends"]},
    {g:"male",p:"How long have you been playing the guitar?",s:"I",e:"high school.",a:["started","learning","way","back","in"]},
    {g:"female",p:"Why did you take up photography?",s:"I",e:"small moments.",a:["really","enjoy","trying","to","capture"]},
    {g:"male",p:"Do you read a lot in your free time?",s:"Yes,",e:"every night.",a:["I","try","to","read","at","least","a few pages"]},
    {g:"female",p:"Have you finished the puzzle you were working on?",s:"Almost,",e:"a few pieces.",a:["I'm","just","still","carefully","missing"],alt:[["I'm","still","just","carefully","missing"]]},
    {g:"male",p:"What got you interested in painting?",s:"I",e:"as a child.",a:["was","truly","inspired","by","my","grandmother"]},
    {g:"female",p:"Do you play any team sports?",s:"Yes,",e:"on Sundays.",a:["I","play","volleyball","with","my","neighbors"]},
    {g:"male",p:"Why do you collect old records?",s:"I",e:"of vinyl.",a:["simply","love","the","warm","sound"]},
    {g:"female",p:"How do you usually relax after a busy day?",s:"I",e:"some quiet music.",a:["like","to","unwind","by","listening","to"]},
    {g:"male",p:"Would you ever try painting professionally?",s:"Maybe,",e:"just a hobby.",a:["but","for","now","it","remains"]}
  ]},
  { set:7, theme:"Technology", items:[
    {g:"female",p:"Do you spend a lot of time on your phone?",s:"Probably",e:"I should.",a:["a","whole","lot","more","than"]},
    {g:"male",p:"Why did you switch to a new laptop?",s:"My",e:"too slow.",a:["old","one","had","become","painfully"]},
    {g:"female",p:"Have you backed up your files recently?",s:"Yes,",e:"the cloud.",a:["I","carefully","saved","everything","to"]},
    {g:"male",p:"How do you keep your passwords safe?",s:"I",e:"manager app.",a:["use","a","really","reliable","password"]},
    {g:"female",p:"Did the software update fix the problem?",s:"It did,",e:"a few times.",a:["but","only","after","I","had","restarted","the computer"]},
    {g:"male",p:"Why don't you use social media much?",s:"I",e:"in person.",a:["prefer","actually","connecting","with","people"]},
    {g:"female",p:"Can you help me set up this device?",s:"Of course,",e:"the manual.",a:["let's","start","by","carefully","reading"]},
    {g:"male",p:"Have you ever tried coding?",s:"Yes,",e:"a simple game.",a:["I","once","actually","tried","building"]},
    {g:"female",p:"Why is your screen brightness so low?",s:"It",e:"my eyes.",a:["really","helps","me","reduce","strain","on"]},
    {g:"male",p:"Do you think robots will replace many jobs?",s:"Some,",e:"new ones.",a:["but","they","may","also","create"]}
  ]},
  { set:8, theme:"Health & Fitness", items:[
    {g:"female",p:"How do you stay in shape?",s:"I",e:"every morning.",a:["usually","go","for","a","run"]},
    {g:"male",p:"Why did you start doing yoga?",s:"I",e:"my stress.",a:["wanted","a","gentle","way","to","reduce"]},
    {g:"female",p:"Have you been sleeping well lately?",s:"Not really,",e:"too much coffee.",a:["I","think","I've","been","drinking"]},
    {g:"male",p:"What do you do when you feel tired during the day?",s:"I",e:"a short walk.",a:["usually","step","outside","quickly","for"]},
    {g:"female",p:"Did the doctor say anything serious?",s:"No,",e:"more rest.",a:["she","just","kindly","told","me","to","get"],alt:[["she","kindly","just","told","me","to","get"]]},
    {g:"male",p:"Why don't you drink soda anymore?",s:"I",e:"too much sugar.",a:["realized","that","it","clearly","had"]},
    {g:"female",p:"How often do you go to the gym?",s:"I",e:"a week.",a:["try","to","go","three","times"]},
    {g:"male",p:"Are you feeling better after the weekend?",s:"Much better,",e:"a lot.",a:["honestly","resting","at","home","helped"]},
    {g:"female",p:"What helps you relax before bed?",s:"I",e:"some tea.",a:["usually","drink","a","warm","cup","of"]},
    {g:"male",p:"Why are you drinking so much water today?",s:"The doctor",e:"hydrated.",a:["advised","me","to","stay","properly"]}
  ]},
  { set:9, theme:"Weather, Seasons & Nature", items:[
    {g:"female",p:"Do you think it will rain this afternoon?",s:"It",e:"that way.",a:["certainly","looks","a","little","bit"]},
    {g:"male",p:"Why do you like autumn so much?",s:"I",e:"change color.",a:["love","watching","all","the","leaves"]},
    {g:"female",p:"How was the weather during your trip?",s:"It",e:"the whole week.",a:["surprisingly","stayed","beautifully","sunny","for"]},
    {g:"male",p:"Should we bring jackets tonight?",s:"Yes,",e:"after sunset.",a:["it","tends","to","get","cold","right"]},
    {g:"female",p:"Why didn't you go to the beach yesterday?",s:"The",e:"too strong.",a:["wind","was","unfortunately","blowing","far"]},
    {g:"male",p:"What's your favorite season for traveling?",s:"I",e:"the crowds.",a:["prefer","spring","mainly","to","avoid"]},
    {g:"female",p:"Did the storm cause any damage?",s:"Luckily,",e:"a few branches.",a:["it","only","actually","knocked","down"],alt:[["it","actually","only","knocked","down"]]},
    {g:"male",p:"How do you cope with the summer heat?",s:"I",e:"the afternoon.",a:["mostly","try","to","stay","indoors","during"]},
    {g:"female",p:"Why are you planting trees in your yard?",s:"I",e:"more shade.",a:["really","want","to","gradually","create","a","bit"]},
    {g:"male",p:"Is it usually this foggy in the morning?",s:"Yes,",e:"by noon.",a:["but","it","always","clears","up"]}
  ]},
  { set:10, theme:"Shopping & Services", items:[
    {g:"female",p:"Did you find what you were looking for?",s:"Yes,",e:"the right size.",a:["it","took","a","while","to","find"]},
    {g:"male",p:"Why did you return the jacket?",s:"It",e:"too small.",a:["unfortunately","turned","out","to","be"]},
    {g:"female",p:"How was the customer service at the store?",s:"The staff",e:"very patient.",a:["were","helpful","kind","and","also"]},
    {g:"male",p:"Are these shoes on sale?",s:"Yes,",e:"this weekend.",a:["they're","actually","half","price","until"]},
    {g:"female",p:"Why do you always shop at the local market?",s:"The produce",e:"the supermarket.",a:["is","much","fresher","than","at"]},
    {g:"male",p:"Did you get a receipt for your purchase?",s:"Yes,",e:"my wallet.",a:["I","carefully","put","it","in"]},
    {g:"female",p:"Can I pay with a card here?",s:"Of course,",e:"all major cards.",a:["we","actually","very","gladly","accept"]},
    {g:"male",p:"Why is this bakery always so busy?",s:"Their bread",e:"in the city.",a:["is","truly","some","of","the","best"]},
    {g:"female",p:"Did the delivery arrive on time?",s:"Yes,",e:"this morning.",a:["it","came","right","on","schedule"]},
    {g:"male",p:"Would you recommend that online shop?",s:"Yes,",e:"their shipping.",a:["I've","honestly","never","had","a","problem","with"]}
  ]},
  { set:11, theme:"Friends & Social Life", items:[
    {g:"female",p:"How did you meet your best friend?",s:"We",e:"in college.",a:["first","met","during","our","first","year"]},
    {g:"male",p:"Why didn't you come to the party last night?",s:"I",e:"a long day.",a:["was","completely","exhausted","right","after"]},
    {g:"female",p:"Are you going to call her back?",s:"Yes,",e:"after lunch.",a:["I'll","get","in","touch","with","her"]},
    {g:"male",p:"What do you usually do with your friends on Fridays?",s:"We",e:"a movie.",a:["often","get","together","to","watch"]},
    {g:"female",p:"Did you remember his birthday this year?",s:"Yes,",e:"a small gift.",a:["I","even","kindly","got","him"],alt:[["I","kindly","even","got","him"]]},
    {g:"male",p:"Why are you so close to your cousins?",s:"We",e:"as kids.",a:["basically","grew","up","together","right","next","door"]},
    {g:"female",p:"Have you apologized to her yet?",s:"Not yet,",e:"the right words.",a:["I'm","still","really","trying","to","find"],alt:[["I'm","still","trying","to","really","find"]]},
    {g:"male",p:"How do you keep in touch with old friends?",s:"We",e:"every few months.",a:["usually","just","video","call","each","other"]},
    {g:"female",p:"Why did you invite so many people?",s:"I",e:"left out.",a:["really","didn't","want","anyone","to","feel"]},
    {g:"male",p:"Are you bringing anyone to the wedding?",s:"Yes,",e:"a friend.",a:["I'm","actually","planning","to","come","with"]}
  ]},
  { set:12, theme:"Goals, Decisions & the Future", items:[
    {g:"female",p:"What are your plans after graduation?",s:"I",e:"a year.",a:["hope","to","travel","abroad","for"]},
    {g:"male",p:"Why did you decide to learn a new language?",s:"I",e:"more people.",a:["wanted","a","way","to","connect","with"]},
    {g:"female",p:"Have you made up your mind about the offer?",s:"Not yet,",e:"the details.",a:["I'm","still","very","carefully","considering","all"]},
    {g:"male",p:"Where do you see yourself in five years?",s:"I",e:"my own business.",a:["hope","to","be","successfully","running"]},
    {g:"female",p:"Why are you saving so much money?",s:"I",e:"an apartment.",a:["really","want","to","eventually","buy"]},
    {g:"male",p:"Did you reach your goal this year?",s:"Almost,",e:"a little more time.",a:["I","honestly","just","really","needed"]},
    {g:"female",p:"What motivates you to keep going?",s:"I",e:"my family proud.",a:["mostly","want","to","be","able","to","make"]},
    {g:"male",p:"Are you nervous about the big decision?",s:"A little,",e:"the right one.",a:["but","I","truly","believe","it's"]},
    {g:"female",p:"Why did you change your major?",s:"I",e:"my true passion.",a:["finally","realized","that","I","had","discovered"]},
    {g:"male",p:"How do you handle setbacks?",s:"I",e:"a lesson.",a:["try","to","see","each","one","as"]}
  ]}
];
if(typeof module!=='undefined'){module.exports=BAS_SETS;}
