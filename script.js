const API_ID = "6554611f";
const API_KEY = "c655262a24df3e90e027ee9a46f497e3";
const calorieGoal = 2500;

const errorMsg = document.getElementById("error_msg");
const foodForm = document.getElementById("food_form");
const foodItem = document.getElementById("food_item");
const foodList = document.getElementById("item");
const totalCalories = document.getElementById("total_calories");
const resetBtn = document.getElementById("reset_btn");

let foods = [];

function showError(message) {
  errorMsg.innerHTML = `<div class="bg-red-200 text-red-800 p-2 rounded mb-2">${message}</div>`;
}

function render() {
  foodList.innerHTML = "";
  let total = 0;

  foods.forEach((food) => {
    total += food.calories;
    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center bg-gray-100 p-2 rounded transition-all duration-300 ease-in-out";

    li.innerHTML = `
            <span>${food.name} - ${food.calories} cal</span>
            <div class="space-x-2">
                <button class="bg-yellow-500 text-white px-2 rounded hover:bg-yellow-600">Edit</button>
                <button class="bg-red-500 text-white px-2 rounded hover:bg-red-600">Remove</button>
            </div>
        `;

    async function fetchCalories(foodName) {
      try {
        const res = await fetch(
          "https://trackapi.nutritionix.com/v2/natural/nutrients",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-app-id": API_ID,
              "x-app-key": API_KEY,
            },
            body: JSON.stringify({ query: foodName }),
          }
        );

        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        return data.foods[0].nf_calories;
      } catch (error) {
        showError("Failed to fetch calories. Check food name or API key.");
        return null;
      }
    }

    async function editFood(food) {
      const newName = prompt("Edit food name:", food.name);
      if (!newName) return;
      const newCalories = await fetchCalories(newName);
      if (newCalories === null) return;
      food.name = newName;
      food.calories = Math.round(newCalories);
      render();
    }

    li.querySelectorAll("button")[0].addEventListener("click", () => {
      editFood(food);
    });
    li.querySelectorAll("button")[1].addEventListener("click", () => {
      if (confirm(`Are you sure you want to remove "${food.name}"?`)) {
        foods = foods.filter((f) => f.id !== food.id);
        render();
      }
    });

    foodList.appendChild(li);
  });

  totalCalories.textContent = total;
  updateProgress(total);
}

function updateProgress(total) {
  const progressBar = document.getElementById("progress_bar");
  const percent = Math.min((total / calorieGoal) * 100, 100);
  progressBar.style.width = `${percent}%`;
  progressBar.textContent = `${Math.floor(percent)}%`;
}


async function fetchCalories(foodName) {
  try {
    const res = await fetch(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": API_ID,
          "x-app-key": API_KEY,
        },
        body: JSON.stringify({ query: foodName }),
      }
    );

    if (!res.ok) throw new Error("API request failed");
    const data = await res.json();
    return data.foods[0]?.nf_calories || null;
  } catch (err) {
    showError("Failed to fetch calories. Check food name or API key.");
    return null;
  }
}

foodForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = foodItem.value.trim();
  if (!name) return;

  const calories = await fetchCalories(name);
  if (calories === null) return;

  foods.push({
    id: Date.now(),
    name,
    calories: Math.round(calories),
  });

  foodItem.value = "";
  render();
});

resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the list?")) {
    foods = [];
    render();
  }
});
render();
