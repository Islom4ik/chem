const {PeriodicTable, Compound, Utility}  = require('mendeleev');
const molFormula = require('molecular-formula');
const { Scenes, session, Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.DB;
const clientdb = new MongoClient(url);
clientdb.connect();
const db = clientdb.db('bot');
const collection = db.collection('chemtool');
module.exports = {collection, ObjectId};
const { enter, leave } = Scenes.Stage;

const calcmass = new Scenes.BaseScene("calcmass");
calcmass.enter(async ctx => {
    try {
        return ctx.reply('🔹 Note: Maintain correct elements spelling. Example: Writing "CL (Chlorine)" is incorrect; "Cl" is correct.\n\nEnter formula(example: AgNO3 or Ag N O3):')
    } catch (e) {
        console.error(e);
    }
});

calcmass.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\{\}\[\]\?\/\.,\\\|\/\+\-\=]+/g;
        
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter the chemical formula according to the given example:');

        await ctx.reply('Computing...')
        const stringer = myString;
        const fr = new molFormula(stringer);
        const formula = fr.simplifiedFormula;
        const elementList = await Utility.stringToElementList(formula);
        const forml = await new Compound(elementList);
        
        const formull = await new Compound(forml.elements)
        const mass = await formull.getMass();
        await setTimeout(async () => {
            await ctx.reply(`🟢 Here is the mass of <b>${myString}</b>: <code>${mass}</code>g. Round answer: <code>${Math.round(mass)}</code>g\n\nEnter the command /calc_mass to calculate the mass of another element.`, {parse_mode: "HTML"})
            return ctx.scene.leave('calcmass') 
        }, 1000);
    } catch (e) {
        await ctx.reply('⛔️ An error has occurred. The elements you entered may not have been found.\n\nNote: Maintain correct elements spelling. Example: Writing "CL (Chlorine)" is incorrect; "Cl" is correct.\nEnter again:')
        console.error(e);
    }
})

const getperiod = new Scenes.BaseScene("getperiod");

getperiod.enter(async ctx => {
    try {
        return ctx.reply('🔹 Enter number of period(1 to 7):')
    } catch (e) {
        console.error(e);
    }
});

getperiod.on('text', async ctx => {
    try {
        if (ctx.message.text > 7 || ctx.message.text < 1) return ctx.reply('⚠️ Please enter number of period according to the given example:') 
        let newarr = []
        await ctx.reply('Collecting...')
        const periods = PeriodicTable.getPeriod(ctx.message.text);
        console.log(periods);
        for (let index = 0; index < periods.length; index++) {
            await newarr.push(`📃 <b>Element - ${periods[index].number}</b>: ${periods[index].name}, sym: ${periods[index].symbol}\nType: ${periods[index].type}\nMass: ${periods[index].mass}g\nGroup: ${periods[index].group}\nValence: ${periods[index].valence}\nDensity: ${periods[index].density}`)
        }
        const str = newarr.join('\n\n');
        await setTimeout(async () => {
            await ctx.reply(str, {parse_mode: "HTML"});
            return await ctx.scene.leave('getperiod'); 
        }, 2000);
    } catch (e) {
        await ctx.reply('⚠️ An error has occurred. Please enter number of period according to the given example:')
        console.error(e);
    }
})

const eleminf = new Scenes.BaseScene("eleminf");

eleminf.enter(async ctx => {
    try {
        return ctx.reply('🔹 Enter element(example: H):')
    } catch (e) {
        console.error(e);
    }
});

eleminf.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\.,\\\|\/\+\-\=0-9]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter the chemical element according to the given example:');
        const elem = await PeriodicTable.getElement(myString)
        await ctx.reply(`<b>Chemical element:</b> ${elem.name}, <b>symbol</b>: ${elem.symbol}\n<b>Period</b>: ${elem.period}\n<b>Group</b>: ${elem.group}\n<b>Mass</b>: ${elem.mass}g\n<b>Valence</b>: ${elem.valence}\n<b>Type</b>: ${elem.type}`, {parse_mode: 'HTML'})
        return await ctx.scene.leave('eleminf')
    } catch (e) {
        await ctx.reply('⛔️ An error has occurred. The element you entered may not have been found.\n\nNote: Maintain correct element spelling. Example: Writing "CL (Chlorine)" is incorrect; "Cl" is correct.\nEnter again:')
        return console.error(e);
    }
})
const getgroup = new Scenes.BaseScene("getgroup");

getgroup.enter(async ctx => {
    try {
        return ctx.reply('🔹 Enter group number(1 to 18):')
    } catch (e) {
        console.error(e);
    }
});

getgroup.on('text', async ctx => {
    try { 
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\.,\\\|\/\+\-\=]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter the chemical group number according to the given example:');
        if(ctx.message.text < 1 || ctx.message.text > 18) return await ctx.reply('⚠️ Please enter number of group according to the given example:')
        const elems = await PeriodicTable.getGroup(ctx.message.text);
        let newarr = []
        await ctx.reply('Collecting...')
        for (let i = 0; i < elems.length; i++) {
            await newarr.push(`📃 <b>Element - ${elems[i].number}</b>: ${elems[i].name}, sym: ${elems[i].symbol}\nMass: ${elems[i].mass}g\nPeriod: ${elems[i].period}\nType: ${elems[i].type}\nValence: ${elems[i].valence}`)
        }
        const str = await newarr.join('\n\n')
        await setTimeout(async () => {
            await ctx.reply(`Here is all elements from ${ctx.message.text} group:`)
            await ctx.reply(str, {parse_mode: "HTML"})
            return await ctx.scene.leave('getgroup')
        }, 2000);
    } catch (e) {
        await ctx.reply('⚠️ An error has occurred. Please enter number of group according to the given example:')
        return console.error(e);
    }
})

const sendmess = new Scenes.BaseScene("sendmess");

sendmess.enter(async ctx => {
    try {
        await ctx.reply('🟡 Send the desired message to send it to all users:', {reply_markup: {keyboard: [['Cancel']], resize_keyboard: true}})
    } catch (e) {
        return console.error(e);
    }
});

sendmess.on('message', async ctx => {
    try {
        if (ctx.message.text == 'Cancel') {
            if (ctx.from.id != '5103314362') return;
            await ctx.reply('Canceled', {reply_markup: {keyboard: [['Commands List 📜'], ['Chemical formulas 🧮']], resize_keyboard: true}});
            return await ctx.scene.leave('sendmess');
        }
        await ctx.scene.leave('sendmess')
        await ctx.reply('Sended', {reply_markup: {keyboard: [['Commands List 📜'], ['Chemical formulas 🧮']], resize_keyboard: true}})
        const users = await collection.findOne({_id: ObjectId('63d7abe81e02727c87eb9fbf')})
        for (let i = 0; i < users.users.length; i++) {
            try {
                await setTimeout(async () => {
                    await ctx.tg.forwardMessage(users.users[i], ctx.chat.id, ctx.message.message_id)
                }, 1000);
            } catch (e) {
                if(e.response.description == 'Forbidden: bot was blocked by the user') {
                    await collection.findOneAndUpdate({_id: ObjectId('63d7abe81e02727c87eb9fbf')}, {$pull: {users: users.users[i]}})
                    await collection.findOneAndDelete({user_id: users.users[i]})
                }
                console.log('skiped');
            }
        }
    } catch (e) {
        return console.error(e);
    }
})

const convert = new Scenes.BaseScene("convert");

convert.enter(async ctx => {
    try {
        const userdb = await collection.findOne({user_id: ctx.from.id})
        return await ctx.reply(`🧮 What are we going to convert?\n\nX ➡️ Y`, {parse_mode: "HTML", reply_markup: {inline_keyboard: [[Markup.button.callback('mmHg to kPa', 'mmhgtokpa')],[Markup.button.callback('kPa to mmHg', 'kpatommhg')],[Markup.button.callback('atm to mmHg', 'atmtommhg')],[Markup.button.callback('mmHg to atm', 'mmhgtoatm')], [Markup.button.callback('atm to kPa', 'atmtokpa')], [Markup.button.callback('kPa to atm', 'kpatoatm')], [Markup.button.callback('°C to K', 'ctok')], [Markup.button.callback('K to °C', 'ktoc')], [Markup.button.callback('🔴 Cancel conversion 🔴', 'cancc')]]}})
    } catch (e) {
        return console.error(e);
    }
});

convert.on('message', async ctx => {
    try {
        return await ctx.reply('Please, click on one of the buttons above.')
    } catch (e) {
        return console.error(e);
    }
})

convert.action('cancc', async ctx => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.reply('🔴 Canceled')
        return await ctx.scene.leave('convert')
    } catch (e) {
        console.error(e);
    }
})

convert.action('ctok', async ctx => {
    try {
        await ctx.editMessageText('🧮 We are going to convert:\n\n°C ➡️ K')
        return await ctx.scene.enter('ctokgc')
    } catch (e) {
        console.error(e);
    }
})

convert.action('ktoc', async ctx => {
    try {
        await ctx.editMessageText('🧮 We are going to convert:\n\nK ➡️ °C')
        return await ctx.scene.enter('ktocgk')
    } catch (e) {
        console.error(e);
    }
})

convert.action('mmhgtokpa', async ctx => {
    try {
        await ctx.editMessageText('🧮 We are going to convert:\n\nmmHg ➡️ kPa')
        return await ctx.scene.enter('mmhgtokpagmmhg')
    } catch (e) {
        console.error(e);
    }
})

convert.action('kpatommhg', async ctx => {
    try {
        await ctx.editMessageText('🧮 We are going to convert:\n\nkPa ➡️ mmHg')
        return await ctx.scene.enter('kpatommhggkpa')
    } catch (e) {
        console.error(e);
    }
})

convert.action('atmtommhg', async ctx => {
    try {
        await ctx.editMessageText('🧮 We are going to convert:\n\natm ➡️ mmHg')
        return await ctx.scene.enter('atmtommhgatm')
    } catch (e) {
        console.error(e);
    }
})

convert.action('mmhgtoatm', async ctx => {
    try {
        await ctx.editMessageText('🧮 We are going to convert:\n\nmmHg ➡️ atm')
        return await ctx.scene.enter('mmhgtoatmgmmhg')
    } catch (e) {
        console.error(e);
    }
})

convert.action('atmtokpa', async ctx => {
    try {
        await ctx.editMessageText('🧮 We are going to convert:\n\natm ➡️ kPa')
        return await ctx.scene.enter('atmtokpagatm')
    } catch (e) {
        console.error(e);
    }
})

convert.action('kpatoatm', async ctx => {
    try {
        await ctx.editMessageText('🧮 We are going to convert:\n\nkPa ➡️ atm')
        return await ctx.scene.enter('kpatoatmgkpa')
    } catch (e) {
        console.error(e);
    }
})

const ctokgc = new Scenes.BaseScene("ctokgc");

ctokgc.enter(async ctx => {
    try {
        return ctx.reply('Enter a value for °C:')
    } catch (e) {
        return console.error(e);
    }
});

ctokgc.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\,\\\|\/\+\=\a-z\а-я]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter value of °C:');
        await ctx.reply('Calculating...')
        const math = await 273 + Number(ctx.message.text);
        if(isNaN(math)) return await ctx.reply('Please enter the correct value:');
        await setTimeout(async () => {
            await ctx.replyWithHTML(`Here is the result from converting ${ctx.message.text}°C to K: <b>${math}K</b>`, Markup.inlineKeyboard([[Markup.button.callback('Back to converter', 'additional')]]))
            await ctx.scene.leave('ctokgc')
        }, 1000);
    } catch (e) {
        return console.error(e);
    }
})

const ktocgk = new Scenes.BaseScene("ktocgk");

ktocgk.enter(async ctx => {
    try {
        return ctx.reply('Enter a value for K:')
    } catch (e) {
        return console.error(e);
    }
});

ktocgk.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\,\\\|\/\+\=\a-z\а-я]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter value of K:');
        await ctx.reply('Calculating...')
        const math = await Number(ctx.message.text) - 273;
        if(isNaN(math)) return await ctx.reply('Please enter the correct value:');
        await setTimeout(async () => {
            await ctx.replyWithHTML(`Here is the result from converting ${ctx.message.text}K to °C: <b>${math}°C</b>`, Markup.inlineKeyboard([[Markup.button.callback('Back to converter', 'additional')]]))
            await ctx.scene.leave('ktocgk')
        }, 1000);
    } catch (e) {
        return console.error(e);
    }
})

const mmhgtokpagmmhg = new Scenes.BaseScene("mmhgtokpagmmhg");

mmhgtokpagmmhg.enter(async ctx => {
    try {
        return ctx.reply('Enter a value for mmHg:')
    } catch (e) {
        return console.error(e);
    }
});

mmhgtokpagmmhg.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\,\\\|\/\+\=\a-z\а-я]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter value of mmHg:');
        await ctx.reply('Calculating...')
        const math = await (Number(ctx.message.text) * 101.325) / 760;
        if(isNaN(math)) return await ctx.reply('Please enter the correct value:');
        await setTimeout(async () => {
            await ctx.replyWithHTML(`Here is the result from converting ${ctx.message.text}mmHg to kPa: <b>${math}kPa</b>, round answer: <b>${Math.round(math)}kPa</b>`, Markup.inlineKeyboard([[Markup.button.callback('Back to converter', 'additional')]]))
            await ctx.scene.leave('mmhgtokpagmmhg')
        }, 1000);
    } catch (e) {
        return console.error(e);
    }
})

const kpatommhggkpa = new Scenes.BaseScene("kpatommhggkpa");

kpatommhggkpa.enter(async ctx => {
    try {
        return ctx.reply('Enter a value for kPa:')
    } catch (e) {
        return console.error(e);
    }
});

kpatommhggkpa.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\,\\\|\/\+\=\a-z\а-я]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter value of kPa:');
        await ctx.reply('Calculating...')
        const math = await (Number(ctx.message.text) * 760) / 101.325;
        if(isNaN(math)) return await ctx.reply('Please enter the correct value:');
        await setTimeout(async () => {
            await ctx.replyWithHTML(`Here is the result from converting ${ctx.message.text}kPa to mmHg: <b>${math}mmHg</b>, round answer: <b>${Math.round(math)}mmHg</b>`, Markup.inlineKeyboard([[Markup.button.callback('Back to converter', 'additional')]]))
            await ctx.scene.leave('kpatommhggkpa')
        }, 1000);
    } catch (e) {
        return console.error(e);
    }
})

const atmtommhgatm = new Scenes.BaseScene("atmtommhgatm");

atmtommhgatm.enter(async ctx => {
    try {
        return ctx.reply('Enter a value for atm:')
    } catch (e) {
        return console.error(e);
    }
});

atmtommhgatm.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\,\\\|\/\+\=\a-z\а-я]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter value of atm:');
        await ctx.reply('Calculating...')
        const math = await (Number(ctx.message.text) * 760) / 1;
        if(isNaN(math)) return await ctx.reply('Please enter the correct value:');
        await setTimeout(async () => {
            await ctx.replyWithHTML(`Here is the result from converting ${ctx.message.text}atm to mmHg: <b>${math}mmHg</b>, round answer: <b>${Math.round(math)}mmHg</b>`, Markup.inlineKeyboard([[Markup.button.callback('Back to converter', 'additional')]]))
            await ctx.scene.leave('atmtommhgatm')
        }, 1000);
    } catch (e) {
        return console.error(e);
    }
})

const mmhgtoatmgmmhg = new Scenes.BaseScene("mmhgtoatmgmmhg");

mmhgtoatmgmmhg.enter(async ctx => {
    try {
        return ctx.reply('Enter a value for mmHg:')
    } catch (e) {
        return console.error(e);
    }
});

mmhgtoatmgmmhg.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\,\\\|\/\+\=\a-z\а-я]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter value of mmHg:');
        await ctx.reply('Calculating...')
        const math = await (Number(ctx.message.text) * 1) / 760;
        if(isNaN(math)) return await ctx.reply('Please enter the correct value:');
        await setTimeout(async () => {
            await ctx.replyWithHTML(`Here is the result from converting ${ctx.message.text}mmHg to atm: <b>${math}atm</b>, round answer: <b>${Math.round(math)}atm</b>`, Markup.inlineKeyboard([[Markup.button.callback('Back to converter', 'additional')]]))
            await ctx.scene.leave('mmhgtoatmgmmhg')
        }, 1000);
    } catch (e) {
        return console.error(e);
    }
})

const atmtokpagatm = new Scenes.BaseScene("atmtokpagatm");

atmtokpagatm.enter(async ctx => {
    try {
        return ctx.reply('Enter a value for atm:')
    } catch (e) {
        return console.error(e);
    }
});

atmtokpagatm.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\,\\\|\/\+\=\a-z\а-я]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter value of atm:');
        await ctx.reply('Calculating...')
        const math = await (Number(ctx.message.text) * 101.325) / 1;
        if(isNaN(math)) return await ctx.reply('Please enter the correct value:');
        await setTimeout(async () => {
            await ctx.replyWithHTML(`Here is the result from converting ${ctx.message.text}atm to kPa: <b>${math}kPa</b>, round answer: <b>${Math.round(math)}kPa</b>`, Markup.inlineKeyboard([[Markup.button.callback('Back to converter', 'additional')]]))
            await ctx.scene.leave('atmtokpagatm')
        }, 1000);
    } catch (e) {
        return console.error(e);
    }
})

const kpatoatmgkpa = new Scenes.BaseScene("kpatoatmgkpa");

kpatoatmgkpa.enter(async ctx => {
    try {
        return ctx.reply('Enter a value for kPa:')
    } catch (e) {
        return console.error(e);
    }
});

kpatoatmgkpa.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\,\\\|\/\+\=\a-z\а-я]+/g;
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter value of kPa:');
        await ctx.reply('Calculating...')
        const math = await (Number(ctx.message.text) * 1) / 101.325;
        if(isNaN(math)) return await ctx.reply('Please enter the correct value:');
        await setTimeout(async () => {
            await ctx.replyWithHTML(`Here is the result from converting ${ctx.message.text}kPa to atm: <b>${math}atm</b>, round answer: <b>${Math.round(math)}atm</b>`, Markup.inlineKeyboard([[Markup.button.callback('Back to converter', 'additional')]]))
            await ctx.scene.leave('kpatoatmgkpa')
        }, 1000);
    } catch (e) {
        return console.error(e);
    }
})


const stage = new Scenes.Stage([calcmass, getperiod, eleminf, getgroup, sendmess, convert, ctokgc, ktocgk, mmhgtokpagmmhg, kpatommhggkpa, atmtommhgatm, mmhgtoatmgmmhg, atmtokpagatm, kpatoatmgkpa]);  
bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
    try {
        await ctx.replyWithPhoto({source: 'preview.jpg'}, {caption: '<b>Hello There!</b>\n\n🧪 <b>Molecular Magician</b> - is your personal chemistry assistant. With advanced computational capabilities, it can calculate molecular weights, identify elements and compounds, and provide detailed information on various chemical reactions. Say goodbye to tedious textbook calculations and let the Magician do the work for you!\n\nPOWERED BY OG_DIMES', parse_mode: "HTML", reply_markup: {keyboard: [['Commands List 📜'], ['Chemical formulas 🧮']], resize_keyboard: true}}) 
        const userdb = await collection.findOne({user_id: ctx.from.id})
        if (userdb == null) {
            await collection.insertOne({user_id: ctx.from.id})
            await collection.findOneAndUpdate({_id: ObjectId('63d7abe81e02727c87eb9fbf')}, {$push: {users: ctx.from.id}})
        }
    } catch (e) {
        console.error(e);
    }
    
});

bot.help((ctx) => ctx.reply('📜 Commands List:\n\n🔸 calc_mass - Returns the molecular mass of the compound.(formula or elem)\n\n🔸 get_period - Takes an elementary period (from 1 to 7) as an argument, returning all elements in the typed period. (number 1-7)\n\n🔸 elem_inf - Returns the element\'s data (elem)\n\n🔸 p_table - returns periodic table\n\n🔸 get_group - returns entered group\'s elements\n\n🔸 convert - converts(°C to K; K to °C; mmHg to kPa; atm to kPa)\n\nPress the menu button to try them 🟠'));

bot.hears(['Commands List 📜'], async ctx => {
    try {
        await ctx.reply('📜 Commands List:\n\n🔸 calc_mass - Returns the molecular mass of the compound.(formula or elem)\n\n🔸 get_period - Takes an elementary period (from 1 to 7) as an argument, returning all elements in the typed period. (number 1-7)\n\n🔸 elem_inf - Returns the element\'s data (elem)\n\n🔸 p_table - returns periodic table\n\n🔸 get_group - returns entered group\'s elements\n\n🔸 convert - converts(°C to K; K to °C; mmHg to kPa; atm to kPa)\n\nPress the menu button to try them 🟠');
        const userdb = await collection.findOne({user_id: ctx.from.id})
        if (userdb == null) {
            await collection.insertOne({user_id: ctx.from.id})
            await collection.findOneAndUpdate({_id: ObjectId('63d7abe81e02727c87eb9fbf')}, {$push: {users: ctx.from.id}})
        }
    } catch (e) {
        console.error(e);
    }
})

bot.hears(['Cancel'], async ctx => {
    try {
        if (ctx.from.id != '5103314362') return;
        await ctx.reply('Canceled', {reply_markup: {keyboard: [['Commands List 📜'], ['Chemical formulas 🧮']],resize_keyboard: true}});
        return await ctx.scene.leave('sendmess');
    } catch (e) {
        console.error(e);
    }
})

bot.hears(['Chemical formulas 🧮'], async ctx => {
    try {
        await ctx.reply('📜 Formulas List:\n\n🧮 <b>Ideal Gas Law</b>: <code>PV=nRT</code>\n\n🧮 <b>Boyle’s Law</b>: <code>P1*V1=P2*V2</code>\n\n🧮 <b>Charles’s Law</b>: <code>V1/T1=V2/T2</code>\n\n🧮 <b>Gay-Lussac’s Law</b>: <code>P1/T1=P2/T2</code>\n\n🧮 <b>Combined Gas Law</b>: <code>(P1*V1)/T1=(P2*V2)/T2</code>', {parse_mode: "HTML"});
        const userdb = await collection.findOne({user_id: ctx.from.id})
        if (userdb == null) {
            await collection.insertOne({user_id: ctx.from.id})
            await collection.findOneAndUpdate({_id: ObjectId('63d7abe81e02727c87eb9fbf')}, {$push: {users: ctx.from.id}})
        }
    } catch (e) {
        console.error(e);
    }
})

bot.hears(['og_dimes'], async ctx => {
    try {
        if (ctx.from.id != '5103314362') return;
        await ctx.scene.enter('sendmess')
    } catch (e) {
        console.error(e);
    }
})

bot.command('calc_mass', async ctx => {
    try {
        return await ctx.scene.enter('calcmass')
    } catch (e) {
        console.error(e);
    }
})

bot.command('get_period', async ctx => {
    try {
        return await ctx.scene.enter('getperiod')
    } catch (e) {
        console.error(e);
    }
})

bot.command('get_group', async ctx => {
    try {
        return await ctx.scene.enter('getgroup')
    } catch (e) {
        console.error(e);
    }
})

bot.command('elem_inf', async ctx => {
    try {
        return await ctx.scene.enter('eleminf')
    } catch (e) {
        console.error(e);
    }
})

bot.command('p_table', async ctx => {
    try {
        return ctx.replyWithPhoto({source: 'ptable.jpg'})
    } catch (e) {
        console.error(e);
    }
})

bot.command('convert', async ctx => {
    try {
        return await ctx.scene.enter('convert')
    } catch (e) {
        console.error(e);
    }
})

bot.action('additional', async ctx => {
    try {
        await ctx.editMessageText(`🟢 ${ctx.callbackQuery.message.text}`)
        return await ctx.scene.enter('convert')
    } catch (e) {
        console.error(e);
    }
})

bot.launch({dropPendingUpdates: true});
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

