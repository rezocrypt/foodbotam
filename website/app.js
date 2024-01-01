const md5 = require("md5");
const path = require('path');
const { log } = require("util");
const express = require('express');
const session = require("express-session");

const fs = require('fs');
const { connect } = require("http2");
const app = express();
const port = 3000;
const au = "d6ca3fd0c3a3b462ff2b83436dda495e"
const ap = "553225726ea919e57e3d61bcaf4a1b24"

var admin_loggedin = false;
var language = "am";
var translated = JSON.parse(fs.readFileSync("data/translation.json"));


// Defining server proparties
app.set("view engine", "ejs");
app.use(express.urlencoded());
app.use(express.static('public'))
app.use(session({
	secret: "dbec174f7b9410798058da89188f2f4c",
	resave: false,
	saveUninitialized: true
}));
app.use(express.static(__dirname + '/public'));

// Function which will add new message from contact us page
function add_message(name, email, phone, message) {
	let ts = Date.now();
	let json_file_path = `data/messages.json`
	let json_data = JSON.parse(fs.readFileSync(json_file_path));
	let date_ob = new Date(ts);
	let milliseconds = date_ob.getMilliseconds();
	let seconds = date_ob.getSeconds();
	let minutes = date_ob.getMinutes();
	let hours = date_ob.getHours();
	let date = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();
	let full_date = year + "_" + month + "_" + date + "_" + hours + "_" + minutes + "_" + seconds + "_" + milliseconds
	json_data[full_date] = {}
	console.log(`Mail: ${email}`);
	json_data[full_date]["surname"] = name
	json_data[full_date]["email"] = email
	json_data[full_date]["phone"] = phone
	json_data[full_date]["message"] = message
	let jsonContent = JSON.stringify(json_data);
	fs.writeFile(json_file_path, jsonContent, "utf8", function (err) { });
	console.log(full_date);
}

// Function which will return messages
function get_messages(astext = true) {
	let ts = Date.now();
	let json_file_path = `data/messages.json`
	let json_data = fs.readFileSync(json_file_path);
	if (astext) {
		return json_data
	}
	else {
		json_data = JSON.parse(json_data)
		return json_data
	}
}

// Function which will return true if file exist or false if not exist
function check_file_exist(name) {
	const file_path = path.join(__dirname, `devices/${md5(name)}.json`)
	return fs.existsSync(file_path)
}

// Function which will make file by given name ading .json at the end
function make_json_file(name, password) {
	json_file_path = `devices/${md5(name)}.json`
	let jsonData = `
{
	"password" : "${md5(password)}",
	"type" : "sandwich",
	"status" : "not working",
	"container_1" : {"name" : "bread" , "image_path" : "images/sandwich/bread.png", "layer_image_path" : "images/sandwichlayers/bread.png"},
	"container_2" : {"name" : "tomato", "image_path" : "images/sandwich/tomato.png", "layer_image_path" : "images/sandwichlayers/tomato.png"},
	"container_3" : {"name" : "cucumber", "image_path" : "images/sandwich/cucumber.png", "layer_image_path" : "images/sandwichlayers/cucumber.png"},
	"container_4" : {"name" : "sausage", "image_path" : "images/sandwich/sausage.png", "layer_image_path" : "images/sandwichlayers/sausage.png"},
	"container_5" : {"name" : "ketchup", "image_path" : "images/sandwich/ketchup.png", "layer_image_path" : "images/sandwichlayers/ketchup.png"},
	"container_6" : {"name" : "mayonnaise", "image_path" : "images/sandwich/mayonnaise.png", "layer_image_path" : "images/sandwichlayers/mayonnaise.png"},
	"container_7" : {"name" : "salt", "image_path" : "images/sandwich/salt.png", "layer_image_path" : "images/sandwichlayers/salt.png"},
	"container_8" : {"name" : "pepper", "image_path" : "images/sandwich/pepper.png", "layer_image_path" : "images/sandwichlayers/pepper.png"}
}
	`;
	let jsonObj = JSON.parse(jsonData);
	let jsonContent = JSON.stringify(jsonObj);
	fs.writeFileSync(json_file_path, jsonData, "utf8", function (err) { });
}

function edit_container(container, newname, device_id, loggedin) {
	if (!loggedin) {
		res.redirect("/login")
		return 0
	}
	let json_file_path = `devices/${md5(device_id)}.json`
	let json_data = JSON.parse(fs.readFileSync(json_file_path));
	if (newname == "cucumber" || newname == "sausage" || newname == "tomato" || newname == "cheese" || newname == "onion" || newname == "green_pepper" || newname == "ketchup" || newname == "mayonnaise" || newname == "mustard" || newname == "salt" || newname == "pepper" || newname == "red_pepper") {
		json_data[container]["name"] = newname
		json_data[container]["type"] = "special"
		json_data[container]["image_path"] = `images/sandwich/${newname}.png`
		json_data[container]["layer_image_path"] = `images/sandwichlayers/${newname}.png`
		let jsonContent = JSON.stringify(json_data);
		fs.writeFile(json_file_path, jsonContent, "utf8", function (err) { });
	}
	else {
		json_data[container]["name"] = newname
		json_data[container]["type"] = "other"
		if (container == "container_1" || container == "container_2" || container == "container_3" || container == "container_4") {
			json_data[container]["image_path"] = `images/sandwich/anotherfood.png`
			json_data[container]["layer_image_path"] = `images/sandwichlayers/anotherfood.png`
		}
		else if (container == "container_5" || container == "container_6") {
			json_data[container]["image_path"] = `images/sandwich/anothersauce.png`
			json_data[container]["layer_image_path"] = `images/sandwichlayers/anothersauce.png`
		}
		else if (container == "container_7" || container == "container_8") {
			json_data[container]["image_path"] = `images/sandwich/anotherspice.png`
			json_data[container]["layer_image_path"] = `images/sandwichlayers/anotherspice.png`
		}
		let jsonContent = JSON.stringify(json_data);
		fs.writeFile(json_file_path, jsonContent, "utf8", function (err) { });
	}
}

// Function for reading json file 
function read_device_info(name) {
	let json_file_path = `devices/${md5(name)}.json`
	let json_data = JSON.parse(fs.readFileSync(json_file_path));
	return json_data
}

// Function which will check if password is true	
function check_password(name, password) {
	let json_file_path = `devices/${md5(name)}.json`
	let json_data = JSON.parse(fs.readFileSync(json_file_path));
	let real_password = json_data["password"]
	return real_password == md5(password)
}

// Function for sending sandwich order
function make_sandwich(steps,device_id,device_password) {
	console.log(steps);
	console.log(device_id);
	console.log(device_password);
	console.log(steps);
	steps_to_send = ""
	for (let i = 0; i < steps.length; i++) {
		steps_to_send += steps[i]
		steps_to_send += " "
	}
	console.log(steps_to_send);
	let mqtt = require('mqtt')
	let client = mqtt.connect('mqtt://localhost:1884')
	let topic = md5(device_id+device_password)
	let message = steps_to_send

	client.on('connect', () => {
		client.publish(topic, message)
		console.log(`[Order completed on topic ${topic} for ${device_id} device]`, message)
	})
	console.log("bareeev");
}


// Website URL redirects to /home
app.get("/", (req, res) => {
	res.redirect("/home")
}
);

// Function for rendering login page
app.get("/login", (req, res) => {
	res.render("login.ejs", { uorp: true, translated: translated, language: language, error: "noerror" })
});

// Function which will work when user login
app.post("/login", (req, res) => {
	let deviceid = req.body.deviceid
	let password = req.body.password
	if (req.session.loggedin) {
		res.redirect("/devicecontrol")
	}
	else {
		if (check_file_exist(deviceid)) {
			if (check_password(deviceid, password)) {
				req.session.loggedin = true;
				req.session.deviceid = deviceid;
				req.session.password = password;
				res.redirect("/devicecontrol")
			}
			else {
				res.render("login.ejs", { uorp: false, translated: translated, language: language, error: "noerror" })
			}
		}
		else {
			res.render("login.ejs", { uorp: true, translated: translated, language: language, error: "login_error" })
		}
	}
});

// Function for login via QR code
app.get("/loginviaqr/:deviceid/:password", (req, res) => {
	let deviceid = req.params.deviceid
	let password = req.params.password
	if (check_file_exist(deviceid)) {
		if (check_password(deviceid, password)) {
			req.session.loggedin = true;
			req.session.deviceid = deviceid;
			req.session.password = password;
			res.redirect("/devicecontrol")
		}
		else {
			res.render("login.ejs", { uorp: false, translated: translated, language: language, error: "noerror" })
		}
	}
	else {
		res.render("login.ejs", { uorp: true, translated: translated, language: language, error: "login_error" })
	}
});

// Function for aboutus page
app.get("/aboutus", (req, res) => {
	res.render("aboutus.ejs", { uorp: req.session.loggedin, language: language, translated: translated })
});

// Function for home page
app.get("/home", (req, res) => {
	res.render("home.ejs", { uorp: req.session.loggedin, language: language, translated: translated })
});

// Function for device control page
app.get("/devicecontrol", (req, res) => {
	if (req.session.loggedin) {
		res.render("devicecontrol.ejs", { uorp: req.session.loggedin, data: read_device_info(req.session.deviceid), language: language, translated: translated })
	}
	else {
		res.redirect("/login")
	}
});

// Function for device control page
app.get("/editcontainers", (req, res) => {
	if (req.session.loggedin) {
		res.render("editcontainers.ejs", { uorp: req.session.loggedin, data: read_device_info(req.session.deviceid), language: language, translated: translated })
	}
	else {
		res.redirect("/login")
	}
});

// Function for runing logout 
app.get("/logout", (req, res) => {
	req.session.loggedin = false
	req.session.deviceid = ""
	req.session.password = ""
	res.redirect("/home")
});

// Function for runing admin logout 
app.get("/adminlogout", (req, res) => {
	req.session.admin_loggedin = false
	admin_loggedin = false
	res.redirect("/admin")
});

// Function for showing products mady by foodbot 
app.get("/products", (req, res) => {
	res.render("products.ejs", { uorp: req.session.loggedin, language: language, translated: translated })
});

// Function for showing contact us page 
app.get("/contactus", (req, res) => {
	res.render("contactus.ejs", { uorp: req.session.loggedin, language: language, translated: translated })
});
app.post("/contactus", (req, res) => {
	add_message(req.body.name, req.body.email, req.body.phone, req.body.message);
	res.redirect("/home")
});

// If you post on this url you will change language
app.get("/changelanguage", (req, res) => {
	res.redirect("/home")
}
);

app.post("/changelanguage/:selected_language", (req, res) => {
	language = req.params.selected_language
	if (language == "armenian") {
		language = "am"
	}
	else if (language == "english") {
		language = "en"
	}
	else if (language == "russian") {
		language = "ru"
	}
});


// Function for changing conainer
app.post("/changecontainer/:container/:newitem", (req, res) => {
	let container = req.params.container
	let newname = req.params.newitem
	edit_container(container, newname, req.session.deviceid, req.session.password)
});

// Function for ordering sandwich
app.get("/ordersandwich/:steps/:time", (req, res) => {
	console.log();
	if (req.session.loggedin)
	{
		string_steps = req.params.steps
		steps = []
		for (let i = 0; i < string_steps.length; i++) {
			steps[i] = string_steps.charCodeAt(i)
		}
		if (req.params.time == "now"){
			make_sandwich(steps,req.session.deviceid,req.session.password)
		}
		else{
			setInterval(()=>{
				console.log("makeeeeeeee");
				make_sandwich(steps,req.session.deviceid,req.session.password)
			}, req.params.time*60*1000)
		}
		console.log(req.params.time);
		res.redirect("/devicecontrol")
	}
	else {
		res.redirect("/login")
	}
});

// Function for opening admin page
app.get("/admin", (req, res) => {
	if (admin_loggedin) {
		res.render("admin.ejs", { uorp: admin_loggedin, translated: translated, language: language, error: "noerror", messages: get_messages(false) })
	}
	else {
		res.render("adminlogin.ejs", { uorp: admin_loggedin, translated: translated, language: language, error: "noerror" })
	}
}
);

// Function for opening admin page
app.post("/admin", (req, res) => {
	console.log(`Problem is here ${req.body.newdevicename} ${req.body.newdevicepassword}`);
	if (req.body.newdգevicename) {
		make_json_file(req.body.newdevicename, req.body.newdevicepassword)
		if (admin_loggedin) {
			res.render("admin.ejs", { uorp: admin_loggedin, translated: translated, language: language, error: "success_device_add", messages: get_messages(false) })
		}
		else {
			res.render("adminlogin.ejs", { uorp: admin_loggedin, translated: translated, language: language, error: "noerror" })
		}
	}
	else {
		if (md5(req.body.adminusername) == au && md5(req.body.adminpassword) == ap) {
			admin_loggedin = true;
			res.redirect("/admin")
		}
		else {
			res.render("adminlogin.ejs", { uorp: false, translated: translated, language: language, error: "admin_login_error" })
		}
	}
});

// Running server
app.listen(port, () => {
	console.log(`Running:\t\ttrue`)
	console.log(`URL:\t\t\thttp://localhost:${port}`)
})
