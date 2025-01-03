let balance = 0;

let inventory = {
  "wheat seeds": 5,
  "carrot seeds": 2,
  "potato seeds": 1,
  "corn seeds": 3,
  corn: 10,
  wheat: 30,
  carrot: 0,
  potato: 0,
  eggplant: 0,
};
const cropPrices = {
  wheat: 5,
  carrot: 8,
  corn: 10,
  potato: 7,
  eggplant: 6,
  "wheat (Rare)": 10,
}; // Selling prices for crops

const itemPrices = {
  sprinkler: 50,
  'bag of dirt': 120, //allows you to turn a water tile into a ground tile
};

const cropConfig = {
  wheat: 3,
  carrot: 5,
  corn: 4,
  potato: 7,
  eggplant: 6,
};

let mastery = {
  wheat: { harvested: 0, level: 0 },
  carrot: { harvested: 0, level: 0 },
  corn: { harvested: 0, level: 0 },
  potato: { harvested: 0, level: 0 },
  eggplant: { harvested: 0, level: 0 },
};

const masteryBonuses = {
  1: {
    description: "Faster growth",
    apply: (tile) => {
      // Reduce growth timer
      tile.dataset.growthTimer = Math.max(1, Math.floor(Math.random() * 2) + 1); // 1-2 ticks
    },
  },
  2: {
    description: "Increased yield",
    apply: (crop) => {
      // Add extra yield
      return 2; // 2 crops per harvest
    },
  },
  3: {
    description: "Chance to get rare crop variant",
    apply: (crop) => {
      // Increase crop value or unlock rare variant
      return `${crop} (Rare)`; // Append rare variant
    },
  },
  4: {
    description: "Chance to get legendary crop variant",
    apply: (crop) => {
      // Increase crop value or unlock legendary variant
      return `${crop} (Legendary)`; // Append legendary variant
    },
  },
};

function updateInventory() {
  // console.log('Inventory updated!');
  let inventoryElement = document.getElementById("inventory");
  inventoryElement.innerHTML = ""; // Clear existing inventory
  for (let item in inventory) {
    let itemElement = document.createElement("div");
    itemElement.textContent = `${item}: ${inventory[item]}`;
    inventoryElement.appendChild(itemElement);
  }
}

function generateGrid() {
  let grid = document.getElementById("grid");
  grid.innerHTML = ""; // Clear any existing grid
  for (let i = 0; i < 5; i++) {
    // Loop to create 4 rows
    let row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < 5; j++) {
      // Loop to create 4 cells in each row
      let cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = `${i}${j}`; // Assign id as coordinates
      let cellType = Math.floor(Math.random() * 2);
      if (cellType === 0) {
        cell.classList.add("ground");
      } else {
        cell.classList.add("water");
      }
      // cell.classList.add('ground'); // Default to ground for manual hoeing

      // Add click listener
      cell.addEventListener("click", () => handleTileClick(cell));

      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
  console.log(grid);
}

function harvestCrop(coords) {
  let tiles = document.getElementsByClassName("cell");
  for (let i = 0; i < tiles.length; i++) {
    let tile = tiles[i];
    if (tile.id === coords) {
      if (!tile.classList.contains("crop")) {
        console.log(`No crop to harvest at tile ${coords}.`);
        return;
      }

      let crop = tile.dataset.crop;
      let growth = parseInt(tile.dataset.growth);
      let maxGrowth = cropConfig[crop] || 3;

      if (growth < maxGrowth) {
        console.log(`Crop ${crop} at tile ${coords} is not fully grown.`);
        return;
      }

      // Apply bonuses
      let yieldAmount = 1; // Base yield
      if (mastery[crop].level >= 2) {
        yieldAmount = masteryBonuses[2].apply(crop); // Increased yield
      }

      let harvestedCrop = crop;
      if (mastery[crop].level >= 3) {
        harvestedCrop = masteryBonuses[3].apply(crop); // Rare variant
      }

      // Update inventory
      inventory[harvestedCrop] = (inventory[harvestedCrop] || 0) + yieldAmount;

      // Add seeds to inventory
      inventory[`${crop} seeds`] =
        (inventory[`${crop} seeds`] || 0) + Math.floor(Math.random() * 3) + 1; // Add 1-3 seeds

      // Update mastery
      mastery[crop].harvested++;
      updateMastery(crop);

      // Clear the tile
      // tile.classList.remove('crop');
      // tile.dataset.crop = '';
      // tile.dataset.growth = '';
      // tile.textContent = '';
      // tile.style.color = '';

      //replant the crop (Add another option for this)

      if (inventory[`${crop} seeds`] <= 0) {
        console.log(`You don't have any ${crop} seeds to replant.`);
        tile.classList.remove("crop");
        tile.dataset.crop = "";
        tile.dataset.growth = "";
        tile.textContent = "";
        tile.style.color = "";
      }
      inventory[`${crop} seeds`]--;
      tile.classList.add("crop");
      tile.dataset.crop = crop;
      tile.dataset.growth = 0;
      tile.textContent = crop;
      tile.style.color = "black"; // Initial crop text color

      //remove one seed from inventory

      console.log(
        `Harvested ${yieldAmount} ${harvestedCrop} from tile ${coords}.`
      );
      return;
    }
  }
  updateShopInventory();
  updateInventory();
  console.log(`Tile ${coords} not found.`);
}

function updateMastery(crop) {
  const thresholds = [5, 15, 30, 60, 150]; // Harvest thresholds for levels 1, 2, 3
  const bonuses = masteryBonuses;

  let currentLevel = mastery[crop].level;
  let harvested = mastery[crop].harvested;

  if (
    currentLevel < thresholds.length &&
    harvested >= thresholds[currentLevel]
  ) {
    mastery[crop].level++;
    let newLevel = mastery[crop].level;
    console.log(
      `Mastery level up! ${crop} is now level ${newLevel}: ${bonuses[newLevel].description}`
    );
  }
}

function viewMastery() {
  console.log("Crop Mastery Progress:");
  for (let crop in mastery) {
    let progress = mastery[crop];
    console.log(
      `${crop} - Level: ${progress.level}, Harvested: ${progress.harvested}`
    );
  }
}

function handleTileClick(tile) {
  const coords = tile.id;
  const tileType = tile.classList[1];
  const crop = tile.dataset.crop || "None";
  const growth = tile.dataset.growth || "N/A";

  // Create dialog box
  const dialog = document.createElement("div");
  dialog.classList.add("dialog");

  // Build dialog content with tile details
  dialog.innerHTML = `
        <h3>Tile Details</h3>
        <p>Coordinates: ${coords}</p>
        <p>Type: ${tileType}</p>
        <p>Crop: ${crop}</p>
        <p>Growth Stage: ${growth}</p>
        <div id="dialogActions"></div>
        <button id="closeButton">Close</button>
    `;

  //check if there's already a dialog box open. If so, remove it
  if (document.querySelector(".dialog")) {
    document.querySelector(".dialog").remove();
  }
  document.body.appendChild(dialog);

  const actions = document.getElementById("dialogActions");

  // Add action buttons dynamically based on tile type and state
  if (tileType === "ground") {
    const hoeButton = document.createElement("button");
    hoeButton.textContent = "Hoe";
    hoeButton.addEventListener("click", () => {
      runCommand(`hoe ${coords}`);
      dialog.remove(); // Close dialog
    });
    actions.appendChild(hoeButton);

    const sprinklerButton = document.createElement("button");
    sprinklerButton.textContent = "Sprinkler";
    sprinklerButton.addEventListener("click", () => {
      runCommand(`addSprinkler ${coords}`);
      dialog.remove(); // Close dialog
    });
    if(inventory["sprinkler"] <= 0) {
      sprinklerButton.disabled = true;
      actions.appendChild(sprinklerButton);
    }
    else{
      actions.appendChild(sprinklerButton);
    }

    const bagOfDirtButton = document.createElement("button");
    bagOfDirtButton.textContent = "Bag of Dirt";
    bagOfDirtButton.addEventListener("click", () => {
      runCommand(`addBagofDirt ${coords}`);
      dialog.remove(); // Close dialog
    });
    if(balance < itemPrices["bag of dirt"]) {
      bagOfDirtButton.disabled = true;
      actions.appendChild(bagOfDirtButton);
    }
    else{
      actions.appendChild(bagOfDirtButton);
    }
    

  }

  if (tileType === "farmland" && crop === "None") {
    // Add planting dropdown
    const plantForm = document.createElement("div");
    plantForm.innerHTML = `
            <label for="cropSelect">Plant Crop:</label>
            <select id="cropSelect">
                <option value="wheat">Wheat</option>
                <option value="carrot">Carrot</option>
                <option value="potato">Potato</option>
            </select>
            <button id="plantButton">Plant</button>
        `;

    actions.appendChild(plantForm);

    // Add planting functionality
    document.getElementById("plantButton").addEventListener("click", () => {
      const crop = document.getElementById("cropSelect").value;
      runCommand(`plantCrop ${coords} ${crop}`);
      dialog.remove(); // Close dialog
    });
  }

  if (crop !== "None" && growth === `${cropConfig[crop]}`) {
    const harvestButton = document.createElement("button");
    harvestButton.textContent = "Harvest";
    harvestButton.addEventListener("click", () => {
      harvestCrop(coords);
      dialog.remove(); // Close dialog
    });
    actions.appendChild(harvestButton);
  }

  // Close button functionality
  document.getElementById("closeButton").addEventListener("click", () => {
    dialog.remove();
  });
}

let tileDetails = {};

function getTileDetails(coords) {
  let tileType = "";
  let crop = null;
  let growth = null;
  let tiles = document.getElementsByClassName("cell");
  for (let i = 0; i < tiles.length; i++) {
    let tile = tiles[i];
    if (tile.id === coords) {
      tileType = tile.classList[1]; // Assumes the type is the second class
      if (tile.classList.contains("crop")) {
        crop = tile.dataset.crop; // Get the crop name
        growth = parseInt(tile.dataset.growth) || 0; // Get the growth points
      }
    }
  }
  const tileDetails = {
    coords: coords,
    type: tileType,
    crop: crop,
    growth: growth,
  };
  console.log(tileDetails);
  return tileDetails;
}

//check for enter key press
document.getElementById("input").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    let command = document.getElementById("input").value;
    runCommand(command);
  }
});

function plantCrop(coords, crop) {
  let seedType = `${crop} seeds`; // Define seed type based on crop name

  // Check if the inventory has the required seeds
  if (!inventory[seedType] || inventory[seedType] <= 0) {
    console.log(`You don't have enough ${seedType} to plant.`);
    return;
  }

  let tiles = document.getElementsByClassName("cell");
  for (let i = 0; i < tiles.length; i++) {
    let tile = tiles[i];
    if (tile.id === coords) {
      if (!tile.classList.contains("farmland")) {
        console.log(`Tile ${coords} is not farmland. Cannot plant ${crop}.`);
        return;
      }
      if (tile.classList.contains("crop")) {
        console.log(`Tile ${coords} already has a crop. Cannot plant ${crop}.`);
        return;
      }

      // Deduct seeds from inventory
      inventory[seedType]--;
      console.log(
        `Planted ${crop} on tile ${coords}. You have ${inventory[seedType]} ${seedType} left.`
      );

      // Add crop to tile
      tile.classList.add("crop");
      tile.dataset.crop = crop;
      tile.dataset.growth = 0;

      // Apply mastery bonus for Level 1 (Faster Growth)
      if (mastery[crop].level >= 1) {
        masteryBonuses[1].apply(tile); // Reduce growth timer
      } else {
        tile.dataset.growthTimer = Math.floor(Math.random() * 3) + 2; // Default 2-4 ticks
      }

      tile.textContent = crop;
      tile.style.color = "black"; // Initial crop text color
      return { coords: coords, crop: crop };
    }
  }
  console.log(`Tile ${coords} not found.`);
}

function cropTick() {
  console.log("Crops are growing!");
  let tiles = document.getElementsByClassName("crop");
  for (let i = 0; i < tiles.length; i++) {
    let tile = tiles[i];
    let crop = tile.dataset.crop;
    let growth = parseInt(tile.dataset.growth) || 0;
    let growthTimer = parseInt(tile.dataset.growthTimer) || 0;

    // Get the maximum growth stage for the crop
    let maxGrowth = cropConfig[crop] || 3; // Default to 3 if crop not defined

    if (growth < maxGrowth) {
      if (growthTimer > 0) {
        // Decrement the growth timer
        tile.dataset.growthTimer = growthTimer - 1;
        console.log(
          `Crop ${crop} on tile ${tile.id} is waiting. Timer: ${
            growthTimer - 1
          }`
        );
      } else {
        // Timer has reached zero, increment growth
        growth++;
        tile.dataset.growth = growth;

        // Assign a new random timer for the next stage
        tile.dataset.growthTimer = Math.floor(Math.random() * 3) + 2;

        // Update crop text color based on growth stage
        if (growth === 1) {
          tile.style.color = "green"; // Stage 1
        } else if (growth === 2) {
          tile.style.color = "orange"; // Stage 2
        } else if (growth === maxGrowth) {
          tile.style.color = "gold"; // Fully grown
        }

        console.log(
          `Crop ${crop} on tile [${tile.id.split(
            ""
          )}] has grown to stage ${growth}/${maxGrowth}.`
        );
      }
    } else {
      console.log(`Crop ${crop} on tile ${tile.id} is fully grown.`);
    }
  }
}

setInterval(updateInventory, 500); // Call the updateInventory function every second

function runCommand(command) {
  const [cmd, ...args] = command.split(" "); // Split input into command and arguments

  if (cmd === "tileDetails") {
    const coords = args[0]; // Get the coordinates
    return getTileDetails(coords); // Call the function with the given coordinates
  } else if (cmd === "plantCrop") {
    const coords = args[0]; // First argument is the coordinates
    const crop = args[1]; // Second argument is the crop name
    if (!coords || !crop) {
      console.log("Invalid command! Usage: plantCrop <coords> <crop>");
      return;
    }
    updateInventory();
    return plantCrop(coords, crop); // Call the function to plant the crop
  }
  if (cmd === "hoe") {
    let coords = args[0];
    let tiles = document.getElementsByClassName("cell");
    for (let i = 0; i < tiles.length; i++) {
        let tile = tiles[i];
        if (tile.id === coords) {
            if (!tile.classList.contains("ground")) {
                console.log(`Tile ${coords} is not ground. Cannot hoe.`);
                return;
            }
            if(tile.classList.contains("sprinkler")) {
                console.log(`Tile ${coords} has a sprinkler. Cannot hoe.`);
                return;
            }

            // Check if there is water or a sprinkler nearby
            let x = parseInt(coords[0]);
            let y = parseInt(coords[1]);
            let nearbyWaterOrSprinkler = false;
            let nearbyTiles = [
                `${x - 1}${y}`,
                `${x + 1}${y}`,
                `${x}${y - 1}`,
                `${x}${y + 1}`,
            ];
            for (let j = 0; j < nearbyTiles.length; j++) {
                let nearbyTile = document.getElementById(nearbyTiles[j]);
                if (nearbyTile && (nearbyTile.classList.contains("water") || nearbyTile.classList.contains("sprinkler"))) {
                    // Check if tile exists and is water or sprinkler
                    nearbyWaterOrSprinkler = true;
                    break;
                }
            }
            if (!nearbyWaterOrSprinkler) {
                console.log(`Tile ${coords} is not near water or a sprinkler. Cannot hoe.`);
                return;
            }
            tile.classList.remove("ground");
            tile.classList.add("farmland");
            console.log(`Hoe'd tile ${coords}.`);
            return { coords: coords };
        }
    }
    console.log(`Tile ${coords} not found.`);
}

  if (cmd == "harvest") {
    let coords = args[0];
    let tiles = document.getElementsByClassName("cell");
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];
      if (tile.id === coords) {
        if (!tile.classList.contains("crop")) {
          console.log(`Tile ${coords} does not have a crop. Cannot harvest.`);
          return;
        }
        let crop = tile.dataset.crop;
        let growth = parseInt(tile.dataset.growth) || 0;
        if (growth < 3) {
          console.log(
            `Crop ${crop} on tile ${coords} is not fully grown. Cannot harvest.`
          );
          return;
        }
        tile.classList.remove("crop");
        tile.textContent = "";
        tile.dataset.crop = "";
        tile.dataset.growth = 0;
        console.log(`Harvested ${crop} from tile ${coords}.`);
        inventory[crop]++;
        inventory[`${crop} seeds`] = (inventory[`${crop} seeds`] || 0) + 1;
        console.log(
          `You now have ${inventory[crop]} ${crop} and ${
            inventory[`${crop} seeds`]
          } ${crop} seeds.`
        );
        updateInventory();
        return { coords: coords, crop: crop };
      }
    }
    console.log(`Tile ${coords} not found.`);
  }

  if (cmd == "inventory") {
    console.log(inventory);
  }
  if(cmd == 'addSprinkler') {
    //check that sprinkler is an item in the player's inventory
    if (!inventory["sprinkler"] || inventory["sprinkler"] <= 0) {
      console.log(`You don't have any sprinklers to add.`);
      return;
    }
    let coords = args[0];
    let tiles = document.getElementsByClassName("cell");
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];
      if (tile.id === coords) {
        if (!tile.classList.contains("ground")) {
          console.log(`Tile ${coords} is not ground. Cannot add sprinkler.`);
          return;
        }
        tile.classList.add("sprinkler");
        tile.textContent = "S";
        console.log(`Added sprinkler to tile ${coords}.`);
        return { coords: coords };
      }
    }
    console.log(`Tile ${coords} not found.`);
  }
  
  else {
    console.log("Invalid command!");
  }
}

function getFarmSeed() {
  //the seed is the numeric value of the grid, multiplied by a random number
  let seed = "";
  for(let i = 0; i < 4; i++) {
    for(let j = 0; j < 4; j++) {
      seed += document.getElementById(`${i}${j}`).classList.contains("water") ? "0" : "1";
      seed += document.getElementById(`${i}${j}`).classList.contains("farmland") ? "0" : "2";
      seed += document.getElementById(`${i}${j}`).classList.contains("ground") ? "0" : "3";

    }
    
  }
  return seed;
}

//---- Shop functions
// Open and Close Shop
document.getElementById("shopButton").addEventListener("click", openShop);
document.getElementById("closeShopButton").addEventListener("click", closeShop);

function buyItem(item) {
  if (balance >= itemPrices[item]) {
    balance -= itemPrices[item]; // Deduct money from balance
    inventory[item] = (inventory[item] || 0) + 1; // Add item to inventory
    console.log(`Purchased 1 ${item} for $${itemPrices[item]}.`);
    // updateShopInventory(); // Refresh shop UI
    updateInventory(); // Refresh inventory UI
  } else {
    console.log(`You don't have enough money to buy ${item}.`);
  }
}

function openShop() {
//close any active shop dialog
    if (document.querySelector(".dialog")) {
        document.querySelector(".dialog").remove();
    }

  const shopDialog = document.createElement("div");
  shopDialog.classList.add("dialog");
  shopDialog.innerHTML = `
        <h3>Farmers' Market</h3>
        <p>Sell your crops and view mastery progress!</p>
        <div id="shopItems"></div>
        <p>Total Coins: <span id="playerCoins">${balance}</span></p>
        <button id="closeShop">Close</button>
    `;

  document.body.appendChild(shopDialog);

  const shopItems = document.getElementById("shopItems");
  for (let crop in cropConfig) {
    if (inventory[crop] === 0) {
      continue;
    }
    let masteryLevel = mastery[crop].level;
    let harvested = mastery[crop].harvested;

    const itemDiv = document.createElement("div");
    itemDiv.innerHTML = `
            <span>${crop} - Level: ${masteryLevel}, Harvested: ${harvested}, Owned: ${inventory[crop]}</span>
            <button id="sell${crop}">Sell</button>
        `;
    shopItems.appendChild(itemDiv);

    document.getElementById(`sell${crop}`).addEventListener("click", () => {
      sellCrop(crop);
      openShop(); // Refresh shop UI
    //   updateShopInventory();
    });
  }

  //add a hr
  const hr = document.createElement("hr");
  shopItems.appendChild(hr);

  for (let item in itemPrices) {
    const itemDiv = document.createElement("div");
    itemDiv.innerHTML = `
            <span>${item} - Price: $${itemPrices[item]}</span>
            <button id="buy${item}">Buy</button>
        `;
    shopItems.appendChild(itemDiv);

    document.getElementById(`buy${item}`).addEventListener("click", () => {
      buyItem(item);
    });
  }

  document.getElementById("closeShop").addEventListener("click", () => {
    shopDialog.remove();
  });
}

function closeShop() {
  const shop = document.getElementById("shop");
  shop.classList.add("hidden");
}

// Update Shop Inventory
// function updateShopInventory() {
//   const shopInventory = document.getElementById("shopInventory");
//   const balanceDisplay = document.getElementById("balance");

//   shopInventory.innerHTML = ""; // Clear previous inventory
//   balanceDisplay.textContent = `Balance: $${balance}`;

//   for (let crop in inventory) {
//     if (inventory[crop] > 0) {
//       //check if crop is a seed. If so, skip it
//       if (crop.includes("seeds")) {
//         continue;
//       }
//       const cropDiv = document.createElement("div");
//       cropDiv.textContent = `${crop.charAt(0).toUpperCase() + crop.slice(1)}: ${
//         inventory[crop]
//       } available (Sell for $${cropPrices[crop]} each)`;

//       const sellButton = document.createElement("button");
//       sellButton.textContent = `Sell ${crop}`;
//       sellButton.addEventListener("click", () => sellCrop(crop));

//       cropDiv.appendChild(sellButton);
//       shopInventory.appendChild(cropDiv);
//     }
//   }
// }

// Sell Crops
function sellCrop(crop) {
  if (inventory[crop] > 0) {
    balance += cropPrices[crop]; // Add money to balance
    inventory[crop]--; // Decrease crop count
    console.log(`Sold 1 ${crop} for $${cropPrices[crop]}.`);
    // updateShopInventory(); // Refresh shop UI
    updateInventory(); // Refresh inventory UI
  } else {
    console.log(`You don't have any ${crop} to sell.`);
  }
}

//---
generateGrid();
updateInventory(); // Initial inventory update
setInterval(cropTick, 5000); // Call the cropTick function every 5 seconds
