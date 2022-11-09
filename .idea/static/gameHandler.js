class Building {
    constructor(id, name, bps, price, description) {
        this.bps = bps;
        this.price = price;
        this.name = name;
        this.id = id;
        this.description = description;
    }
}

class Upgrade {
    constructor(id, name, buildingID, bpsMultiplier, price, description) {
        this.id = id;
        this.name = name;
        this.buildingID = buildingID;
        this.bpsMultiplier = bpsMultiplier;
        this.price = price;
        this.description = description;
    }
}

const buildings = [
    new Building(0, "Banana Tree", 1, 10, "I know they grow on herbs but I'm lazy."),
    new Building(1, "Banana Orchard", 10, 100, "A bunch of banana 'trees'."),
    new Building(2, "Banana Farm", 50, 500, "No GMOs, locally sourced."),
    new Building(3, "Banana Factory", 100, 1000, "Outsourcing is good for the economy."),
    new Building(4, "Banana Lab", 500, 10000, "Experimentation with 'bananas'."),
    new Building(5, "Banana Ship", 750, 50000, "Import goods straight from Minion IV."),
    new Building(6, "Banana Galaxy", 1000, 100000, "In a center theres a large bruise."),
    new Building(7, "Banana Portal", 5000, 500000, "...a minion dimension?")
];





if (buildings[0].bps == 2) {
    console.log(building.bps + " hello world");

}



const upgrades = [
    new Upgrade(0, "Fertilizer", 0, 2, 50, "Doubles efficiency of banana trees."),
    new Upgrade(1, "Family Picking", 1, 2, 999, "Doubles efficiency of banana orchards."),
    new Upgrade(2, "John Deere Combines", 2, 2, 5000, "Triples efficiency of banana farms."),
    new Upgrade(3, "Minions", 3, 3, 10000, "Triples efficiency of banana factories."),
    new Upgrade(4, "Super Nerds", 4, 2, 50000, "Doubles efficiency of banana labs."),
    new Upgrade(5, "Potassium Fuel", 5, 2, 250000, "Doubles efficiency of banana ships."),
    new Upgrade(6, "Dark Bananas", 6, 3, 1000000, "Triples efficiency of banana galaxies."),
    new Upgrade(7, "Portal Gun", 7, 4, 10000000, "Quadruples efficiency of banana portals.")
];

var bananaButton = document.getElementById("bananaButton");
var bananaDisplay = document.getElementById("bananaDisplay");
var buildingTable = document.getElementById("buildingTable");
var upgradeTable = document.getElementById("upgradeTable");

var numBananas = 0;
var BPC = 1;
var BPS = 0;
var ownedBuildings = [];
var ownedUpgrades = [];
var newUpgrades = [];

var worker = new Worker("static/backgroundWorker.js");
worker.onmessage = receivedWorkerMessage;
worker.postMessage({
    "bps": BPS
});

bananaButton.onclick = bananaClick;

$.ajax({
    url: "ajaxStuff",
    type: 'GET',
    dataType: 'json',
    success: function(res) {
        console.log(res);
        setInfo(res);
    }
});

initializeTables();

function initializeTables() {
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        var newRow = buildingTable.insertRow();
        var name = newRow.insertCell();
        var cost = newRow.insertCell();
        var description = newRow.insertCell();
        name.innerHTML = building.name;
        cost.innerHTML = "<button id=\"building" + building.id + "\" onclick=buildingClick(" + building.id + ")>$" + building.price + "</button>"
        description.innerHTML = building.description;
    }
    for (var i = 0; i < upgrades.length; i++) {
        var upgrade = upgrades[i]
        var newRow = upgradeTable.insertRow();
        var name = newRow.insertCell();
        var cost = newRow.insertCell();
        var description = newRow.insertCell();
        newRow.id = "upgrade" + upgrade.id;
        cost.innerHTML = "<button onclick=upgradeClick(" + upgrade.id + ")>$" + upgrade.price + "</button>"
        name.innerHTML = upgrade.name;
        description.innerHTML = upgrade.description;
    }
}

function upgradeClick(upgradeID) {
    var selectedUpgrade = upgrades[upgradeID];
    if (numBananas - selectedUpgrade.price >= 0) {
        newUpgrades.push(upgradeID);
        numBananas -= selectedUpgrade.price;
        updateBPS();
        updateBananas();
        updateWorker();
    } else
    {
        alert("Not enough bananas");
    }
}

function buildingClick(buildingID) {
    var selectedBuilding = buildings[buildingID];

    if (numBananas - selectedBuilding.price >= 0) {
        numBananas -= selectedBuilding.price;
        ownedBuildings.push(buildingID);
        updateBPS();
        updateBananas();
        updateWorker();
    } else
    {
        alert("Not enough bananas");
    }
}

function setInfo(info) {
    numBananas = info.bananas;
    BPS = info.bps;
    ownedBuildings = info.buildings;
    newUpgrades = info.upgrades;

    updateBPS();
    updateWorker();
    updateBananas();
}

function bananaClick() {
    numBananas += BPC;
    updateBananas();
}

function saveGame() {
    var serverData = {
        "bananas": numBananas,
        "buildings": ownedBuildings,
        "upgrades": ownedUpgrades
    }
    $.ajax({
        type : "POST",
        url : "ajaxStuff",
        data : JSON.stringify(serverData),
        contentType : "application/json",
        dataType : "json",
        success : function(responseParam) {
           console.log(responseParam);
        }
    })
}

function receivedWorkerMessage(event) {
    if (event.data == -1) {
        saveGame();
    }
    else {
        numBananas += event.data;
        updateBananas();
    }
}

function updateBananas() {
    bananaDisplay.innerHTML = numBananas;
}

function updateBPS() {
    BPS = 0;
    for (var i = 0; i < newUpgrades.length; i++) {
        var newUpgrade = upgrades[newUpgrades[i]];
        buildings[newUpgrade.buildingID].bps *= newUpgrade.bpsMultiplier;
        ownedUpgrades.push(newUpgrades[i]);
        document.getElementById("upgrade" + newUpgrades[i]).remove();
    }
    newUpgrades = [];
    for (var i = 0; i < ownedBuildings.length; i++) {
        BPS += buildings[ownedBuildings[i]].bps;
    }
}

function updateWorker() {
    worker.postMessage({
        "bps": BPS
    });
}