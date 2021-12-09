/* eslint-disable no-return-await */
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
require('dotenv').config();
const CoinGecko = require('coingecko-api');
const commands = require('./commands');

const CoinGeckoClient = new CoinGecko();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
  await ctx.reply(`Приветсвуем тебя, ${ctx.message.from.first_name}`);
  await ctx.reply('Выберете монету или напишите название мне', Markup.keyboard(
    [
      ('Bitcoin'), ('Ethereum'), ('Ripple'), ('Dogecoin'), ('Avalanche'), ('Polkadot'), ('Solana'),
    ],
  ));
});

bot.on('message', async (ctx) => {
  try {
    console.log(ctx.message.text);
    const coins = await CoinGeckoClient.coins.all();
    const coin = coins.data.filter((el) => el.symbol === ctx.message.text.toLowerCase()
     || el.id === ctx.message.text.toLowerCase());
    const data1 = await CoinGeckoClient.coins.fetch(coin[0].id, {});
    console.log(data1);
    console.log(data1.data.market_data.price_change_7d_in_currency);

    await ctx.replyWithPhoto(data1.data.image.large);
    await ctx.replyWithHTML(`Курс к рублю: <strong style="color: yellow">${data1.data.market_data.current_price.rub} RUB</strong>
Курс к доллару: <strong>${data1.data.market_data.current_price.usd} USD</strong>
Курс к евро: <strong>${data1.data.market_data.current_price.eur} EUR</strong>`);
    await ctx.replyWithHTML(`Подробнее о ${coin[0].id.toUpperCase()} :`, Markup.inlineKeyboard(
      [
        [Markup.button.callback('Изменение за 24 часа', 'btn1'), Markup.button.callback('Изменение за 7 дней', 'btn2')],
        [Markup.button.callback('Изменение за 30 дней', 'btn3'), Markup.button.callback('История монеты', 'btn7')],
        [Markup.button.callback('website', 'btn4')],
      ],
    ));
    bot.action('btn1', async (ctx) => await ctx.reply(`Изменение за последние 24 часа: ${data1.data.market_data.price_change_24h_in_currency.usd} $`));
    bot.action('btn2', async (ctx) => await ctx.reply(`Изменение за последнюю неделю: ${data1.data.market_data.price_change_percentage_7d} %`));
    bot.action('btn3', async (ctx) => await ctx.reply(`Изменение за последние 30 дней: ${data1.data.market_data.price_change_percentage_30d} %`));
    bot.action('btn7', async (ctx) => await ctx.replyWithHTML(`${data1.data.description.en}`));
    bot.action('btn4', async (ctx) => await ctx.replyWithHTML( `<a href = '${data1.data.links.homepage[0]}'>website</a>`));

  } catch (e) {
    ctx.reply('Я не знаю такой моенты');
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
