const express = require('express');
const app = express();
const exhbs = require('express-handlebars');
const path = require('path');
const rp = require('request-promise');
const $ = require('cheerio');

const port = process.env.PORT || 4000;
const url = 'https://www.imdb.com/find?ref_=nv_sr_fn&q=';

app.engine('.hbs',exhbs({defaultLayout:'layout.hbs',extname: '.hbs'}));
app.set('view engine','hbs');
app.use(express.json());

const searchMovies = (query)=>{
	query = url + query;
	return query;
}

app.get('/',(req,res)=>{
	res.render('index');
});

app.get('/search',(req,res)=>{
	const data = req.query.search;
	rp(searchMovies(data)).then((html)=>{
		let rating = [];
		let title = $('div > h1 > span',html).html();
		let parseUrl = $('td > a',html)[0].attribs.href;
		parseUrl = 'https://www.imdb.com'+parseUrl;
		rp(parseUrl).then((html)=>{
			let str = $('.ratingValue',html).text();
			const imgPath = $('a > img',html)['1'].attribs.src;
			rating.push({rate:str.trim(),imgPath:imgPath,title:title.slice(6,-6)});
			res.render('index',{rating:rating});
		}).catch((e)=>{
			console.log(e);
		});
	}).catch((e)=>{
		console.log(e);
	});
});


app.listen(port, () => console.log(`listening on http://localhost:${port}`));
