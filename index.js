const {PeriodicTable, Compound, Utility}  = require('mendeleev');
const { Scenes, session, Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);
const { enter, leave } = Scenes.Stage;

const calcmass = new Scenes.BaseScene("calcmass");
calcmass.enter(async ctx => {
    try {
        return ctx.reply('🔹 Enter formula(example: AgNO3):')
    } catch (e) {
        console.error(e);
    }
});

calcmass.on('text', async ctx => {
    try {
        const myString = ctx.message.text;
        const searchString = /[\_\!\@\#\№\"\;\$\%\^\:\&\?\*\(\)\{\}\[\]\?\/\.,\\\|\/\+\-\=]+/g;
        
        if (myString.match(searchString)) return await ctx.reply('⚠️ Please enter the chemical formula according to the given example:');

        await ctx.reply('Computing...')
        const formula = myString;
        const elementList = await Utility.stringToElementList(formula);
        const forml = await new Compound(elementList);
        
        const formull = await new Compound(forml.elements)
        const mass = await formull.getMass();
        await setTimeout(async () => {
            await ctx.reply(`🟢 Here is the mass of <b>${myString}</b>: ${mass}`, {parse_mode: "HTML"})
            return ctx.scene.leave('calcmass') 
        }, 1000);
    } catch (e) {
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
        for (let index = 0; index < periods.length; index++) {
            await newarr.push(`${periods[index].number}: ${periods[index].name}\nType: ${periods[index].type}\nMass: ${periods[index].mass}\nGroup: ${periods[index].group}`)
        }
        const str = newarr.join('\n\n');
        await setTimeout(async () => {
            await ctx.reply(str);
            return await ctx.scene.leave('getperiod'); 
        }, 2000);
    } catch (e) {
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
        await ctx.reply(`<b>Chemical element:</b> ${elem.name}, <b>symbol</b>: ${elem.symbol}\n<b>Period</b>: ${elem.period}\n<b>Group</b>: ${elem.group}\n<b>Mass</b>: ${elem.mass}\n<b>Valence</b>: ${elem.valence}\n<b>Type</b>: ${elem.type}`, {parse_mode: 'HTML'})
        return await ctx.scene.leave('eleminf')
    } catch (e) {
        await ctx.reply('⛔️ An error has occurred. The element you entered may not have been found.\nEnter again:')
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
            await newarr.push(`Element №${elems[i].number}: ${elems[i].name}, sym: ${elems[i].symbol}\nMass: ${elems[i].mass}\nPeriod: ${elems[i].period}\nType: ${elems[i].type}\nValence: ${elems[i].valence}`)
        }
        const str = await newarr.join('\n\n')
        await setTimeout(async () => {
            await ctx.reply(str)
            return await ctx.scene.leave('getgroup')
        }, 2000);
    } catch (e) {
        return console.error(e);
    }
})


const stage = new Scenes.Stage([calcmass, getperiod, eleminf, getgroup]);  
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => ctx.replyWithPhoto({source: 'preview.jpg'}, {caption: '<b>Hello There!</b>\n\n🧪 <b>Molecular Magician</b> - is your personal chemistry assistant. With advanced computational capabilities, it can calculate molecular weights, identify elements and compounds, and provide detailed information on various chemical reactions. Say goodbye to tedious textbook calculations and let the Magician do the work for you!\n\nPOWERED BY OG_DIMES', parse_mode: "HTML", reply_markup: {keyboard: [['📜 Commands List 📜']], resize_keyboard: true}}));
bot.help((ctx) => ctx.reply('📜 Commands List:\n\n🔸 calc_mass - Returns the molecular mass of the compound.(formula or elem)\n\n🔸 get_period - Takes an elementary period (from 1 to 7) as an argument, returning all elements in the typed period. (number 1-7)\n\n🔸 elem_inf - Returns the element\'s data (elem)\n\n🔸 p_table - returns periodic table\n\nPress the menu button to try them 🟠'));

bot.hears(['📜 Commands List 📜'], async ctx => {
    try {
        return ctx.reply('📜 Commands List:\n\n🔸 calc_mass - Returns the molecular mass of the compound.(formula or elem)\n\n🔸 get_period - Takes an elementary period (from 1 to 7) as an argument, returning all elements in the typed period. (number 1-7)\n\n🔸 elem_inf - Returns the element\'s data (elem)\n\n🔸 p_table - returns periodic table\n\nPress the menu button to try them 🟠');
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

bot.launch({dropPendingUpdates: true});
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

