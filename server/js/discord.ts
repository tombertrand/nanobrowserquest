import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

import { Sentry } from "./sentry";

const { BOT_TOKEN, NODE_ENV } = process.env;
const isDevelopment = NODE_ENV === "development";

const EventChannel =
  "https://discord.com/api/webhooks/1092217096324268082/Rctr0jWNAaeAleyGOwXvH05hYJcTSeTrqGcUVVH7mnYZLeoFPeX9qbjVw2A9jvkuP_4w";

const ChatChannel =
  "https://discord.com/api/webhooks/979056276589908008/yeov0D7OSvqNp7o6G6Kb6qbm7hB1EnegcnwKRRmr9y-zpe9O_YRb77jS6Fe0URRaJ3NC";

const AnvilChannel =
  "https://discord.com/api/webhooks/1029352905574207519/VWeXf_oqwL3MENHwpkUqTQozlsJ6H_ui_g5m8CJtYRwSQIGQ-fVByJCUQ6q69y-cCki2";

const PurchaseChannel =
  "https://discord.com/api/webhooks/1134147348721832047/BG-isyL2k2byxw3J1F5HRH2KpBMjXRIbN8xTibfCG0VjLAg0vN_ovAEpgik5hZqwhCTd";

const ModeratorSupportChannel =
  "https://discord.com/api/webhooks/1149703440256217098/ycuYn6yn8y5Atb2ysdTltVzIzB7lmeS-KpGn5LTNmnyVumllHhCFY2scGXUvyBVp39SJ";

const ModeratorDebug =
  "https://discord.com/api/webhooks/1157121578807611465/DPTTZrQspuKzO4rpQwOaYpy7HE95nRVIgKQe74MG0bT3QrqqAT_F6vyCgyvTBs7ngweY";

const ModertorTrade =
  "https://discord.com/api/webhooks/1157379165922795662/KGEOmezA84--Kj7NppJPGkdVrPSjZh6KXlNWPMcg-hEwE4vfxxuO4pNq3oqSnPoPpOCW";

// For linking players with Discord
export const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
// eslint-disable-next-line @typescript-eslint/no-floating-promises
discordClient.login(BOT_TOKEN);

export const postMessageToDiscordEventChannel = (content: string) => {
  if (isDevelopment) return;
  try {
    const body = JSON.stringify({
      content,
    });

    fetch(EventChannel, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

export const postMessageToDiscordChatChannel = (content: string) => {
  if (isDevelopment) return;
  try {
    const body = JSON.stringify({
      content,
    });

    fetch(ChatChannel, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

export const postMessageToDiscordAnvilChannel = (content: string) => {
  if (isDevelopment) return;
  try {
    const body = JSON.stringify({
      content,
    });

    fetch(AnvilChannel, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

export const postMessageToDiscordPurchaseChannel = (content: string) => {
  if (isDevelopment) return;
  try {
    const body = JSON.stringify({
      content,
    });

    fetch(PurchaseChannel, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

export const postMessageToModeratorSupportChannel = (content: string) => {
  // if (isDevelopment) return;
  try {
    const body = JSON.stringify({
      content,
    });

    fetch(ModeratorSupportChannel, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

export const postMessageToModeratorDebugChannel = (content: string) => {
  if (isDevelopment) return;
  try {
    const body = JSON.stringify({
      content,
    });

    console.log("postcontent", content);
    fetch(ModeratorDebug, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

export const postMessageToModeratorTradeChannel = (content: string) => {
  if (isDevelopment) return;
  try {
    const body = JSON.stringify({
      content,
    });

    fetch(ModertorTrade, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

export const EmojiMap = {
  sword: "<:Sword:975775115105153154>",
  fire: "<:fireorange:1059946852461580379>",
  fireblue: "<:fireblue:1058822338763817101>",
  firepurple: "<:firepurple:1058822354672832524>",
  chestblue: "<:chestblue:1059945738026623138>",
  chestgreen: "<:chestgreen:1059945739821797376>",
  chestpurple: "<:chestpurple:1059945741285609552>",
  chestdead: "<:chestdead:1166533901573963856>>",
  chestred: "<:chestred:1059945742661329046>",
  "rune-sat": "<:runesat:1059502573624770570>",
  "rune-al": "<:runeal:1059502447879532595>",
  "rune-bul": "<:runebul:1059502031997517984>",
  "rune-nan": "<:runenan:1059502014595338240>",
  "rune-mir": "<:runemir:1059501993296662738>",
  "rune-gel": "<:runegel:1059501080100229120>",
  "rune-do": "<:runedo:1059501054246522900>",
  "rune-ban": "<:runeban:1059501038140403803>",
  "rune-sol": "<:runesol:1059501018578173993>",
  "rune-um": "<:runeum:1059500988584693822>",
  "rune-hex": "<:runehex:1059499691697516554>",
  "rune-zal": "<:runezal:1059499657614589963>",
  "rune-vie": "<:runevie:1059499067987722340>",
  "rune-eth": "<:runeeth:1059498865620942899>",
  "rune-btc": "<:runebtc:1059498530164703232>",
  "rune-vax": "<:runevax:1059498511319711764>",
  "rune-por": "<:runepor:1059498489194762330>",
  "rune-las": "<:runelas:1059498443086778378>",
  "rune-cham": "<:runecham:1059497162267951235>",
  "rune-dur": "<:runedur:1059497139971031140>",
  "rune-fal": "<:runefal:1059497074221142117>",
  "rune-kul": "<:runekul:1059497049705422929>",
  "rune-mer": "<:runemer:1059497027047804938>",
  "rune-qua": "<:runequa:1059497003073159329>",
  "rune-gul": "<:runegul:1059496975789215804>",
  "rune-ber": "<:runeber:1059496952888316055>",
  "rune-tor": "<:runetor:1059496922638995526>",
  "rune-xno": "<:runexno:1059497100515213333>",
  "rune-jah": "<:runejah:1059496904079188100>",
  "rune-shi": "<:runeshi:1059496855794368583>",
  "rune-vod": "<:runevod:1059496817152241834>",
  ringnecromancer: "<:ringnecromancer:1059571078051151912>",
  ringraistone: "<:ringraistone:1092216603929739385>",
  ringfountain: "<:ringfountain:1059571073785536512>",
  ringpumkin: "<:ringpumkin:1167088198749524079>",
  ringminotaur: "<:ringminotaur:1059571075857522803>",
  ringmystical: "<:ringmystical:1059571076608311327>",
  ringbalrog: "<:ringbalrog:1059571071872937984>",
  ringconqueror: "<:ringconqueror:1059571072766328852>",
  ringheaven: "<:ringheaven:1059571075056418896>",
  ringwizard: "<:ringwizard:1059571142899273728>",
  ringgreed: "<:ringgreed:1099738702462320700>",
  amuletcow: "<:amuletcow:1059572661354778774>",
  amuletfrozen: "<:amuletfrozen:1059572663099588760>",
  amuletdemon: "<:amuletdemon:1059572662239768727>",
  amuletmoon: "<:amuletmoon:1059572664366280754>",
  amuletstar: "<:amuletstar:1059877681275076738>",
  amuletskull: "<:amuletskull:1070330528726777898>",
  amuletdragon: "<:amuletdragon:1070330527183274024>",
  amuleteye: "<:amuleteye:1099772443968667708>",
  amuletgreed: "<:amuletgreed:1099738654982807552>",
  grimoire: "<:grimoire:1070767593536901200>",
  powderquantum: "<:quantumpowder:1079106312295694406>",
  soulstone: "<:soulstone:1085735393594462280>",
  stonedragon: "<:stonedragon:1085735395372847194>",
  stonehero: "<:stonehero:1085735396715020319>",
  chalice: "<:chalice:1092862164643094591>",
  scrolltransmuteblessed: "<:scrolltransmuteblessed:1093911575590609056>",
  scrolltransmutepet: "<:scrolltransmutepet:1150427844162371584>",
  scrollupgradesacred: "<:scrollupgradesacred:1093912423024566273>",
  jewelskull: "<:jewelskull:1093959293394485398>",
  nanocoins: "<:nanocoins:1097314083029663744>",
  nbq: "<:nbq:1062753653045329920>",
  bananocoins: "<:bananocoins:1097314050947432479>",
  bargold: "<:bargold:1099083224413655040>",
  helmclown: "<:clownbase:1114554275226452049>",
  helmpumkin: "<:helmpumkin:1165658130609360948>",
  beltgoldwrap: "<:goldwrap:1114554276350525482>",
  iou: "<:iou:1129598838517268531>",
  gold: "<:gold:1097336291189854420>",
  stonesocketblessed: "<:stonesocketblessed:1150118697529245807>",
  zulgurak: "<:zulgurak:1163287656218771507>",
  shaihulud: "<:shaihulud:1157667989513052250>",
  skeletonKing: "<:skeletonKing:976432201887531058>",
  necromancer: "<:necromancer:976842075679113226>",
  cowking: "<:cowking:1157364026565722283>",
  minotaur: "<:minotaur:1157364041895903273>",
  Arachneia: "<:Arachneia:1157668012699156500>",
  butcher: "<:butcher:1156685096888303748>",
  Azrael: "<:Azrael:1156685409233944726>",
  deathbringer: "<:deathbringer:1156687799592960070>",
  scrollupgradeelementmagic: "<:scrollupgradeelementmagic:1163876379461423216>",
  scrollupgradeelementflame: "<:scrollupgradeelementflame:1164034442415833209>",
  scrollupgradeelementlightning: "<:scrollupgradeelementlightning:1163877078278611054>",
  scrollupgradeelementcold: "<:scrollupgradeelementcold:1163880405628354561>",
  scrollupgradeelementpoison: "<:scrollupgradeelementpoison:1163877117700874291>",
  scrollupgradeskillrandom: "<:scrollupgradeskillrandom:1163880822512824410>",
  Bebeking: "<:Bebeking:975777551647649864>",
  press_f_to_pay_respects: "<:press_f_to_pay_respects:1163299391663263844>",
  impossibru: "<:impossibru:1166478382163296387>",
};
