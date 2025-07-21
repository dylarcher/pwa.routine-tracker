export default () => {
	const navButtons = document.querySelectorAll(".nav-button");
	const contentSections = document.querySelectorAll(".content-section");
	const foodSearch = document.getElementById("foodSearch");

	const foodData = {
		Fruits: {
			safe: [
				"Apple",
				"Apricot (fresh)",
				"Blackberries",
				"Blueberries",
				"Cherries",
				"Cranberries",
				"Peaches",
				"Pears",
				"Watermelon",
			],
			caution: ["Grapes", "Kiwi", "Mango", "Raspberries", "Cantaloupe"],
			avoid: [
				"Avocado",
				"Banana",
				"Dried fruits (figs, dates, raisins)",
				"Grapefruit",
				"Lemon",
				"Lime",
				"Orange",
				"Papaya",
				"Pineapple",
				"Plums",
				"Strawberries",
			],
		},
		Vegetables: {
			safe: [
				"Artichoke",
				"Asparagus",
				"Beets",
				"Broccoli",
				"Cabbage",
				"Carrots",
				"Cauliflower",
				"Celery",
				"Cucumber",
				"Garlic",
				"Lettuce",
				"Onion",
				"Sweet Potatoes",
				"Zucchini",
			],
			caution: ["Bell Peppers", "Brussels Sprouts", "Corn", "Peas", "Pumpkin"],
			avoid: [
				"Eggplant",
				"Olives",
				"Pickles",
				"Sauerkraut",
				"Spinach",
				"Tomatoes (and all tomato products)",
			],
		},
		"Proteins & Meats": {
			safe: [
				"Freshly cooked chicken, beef, lamb, pork",
				"Freshly caught fish (e.g., cod, trout)",
				"Egg yolk (some tolerate)",
			],
			caution: [
				"Canned fish (in water, rinsed)",
				"Legumes (beans, lentils, chickpeas - if tolerated)",
			],
			avoid: [
				"Aged meats (salami, pepperoni, bacon)",
				"Canned meats/fish",
				"Processed meats (sausages, hot dogs)",
				"Smoked or cured fish",
				"Shellfish",
				"Leftover meats",
			],
		},
		"Dairy & Alternatives": {
			safe: [
				"Coconut milk",
				"Hemp milk",
				"Rice milk",
				"Goat cheese (fresh)",
				"Ricotta (fresh)",
			],
			caution: ["Butter", "Cream cheese", "Mozzarella (fresh)"],
			avoid: [
				"Aged cheeses (cheddar, parmesan, gouda)",
				"Cow's milk",
				"Buttermilk",
				"Kefir",
				"Sour cream",
				"Yogurt",
			],
		},
		Grains: {
			safe: [
				"Gluten-free oats",
				"Quinoa",
				"Rice (white, brown)",
				"Millet",
				"Corn flour",
				"Rice noodles",
			],
			caution: ["Wheat products (if tolerated)", "Sourdough bread (some)"],
			avoid: ["Most wheat products", "Breads with yeast", "Soy-based products"],
		},
		"Fats & Oils": {
			safe: [
				"Coconut oil",
				"Olive oil (extra virgin)",
				"Ghee (clarified butter)",
			],
			caution: ["Sunflower oil", "Sesame oil"],
			avoid: ["Avocado oil", "Walnut oil"],
		},
		"Nuts & Seeds": {
			safe: ["Chia seeds", "Coconut flakes", "Hemp seeds", "Macadamia nuts"],
			caution: [
				"Almonds",
				"Pecans",
				"Pistachios",
				"Pumpkin seeds",
				"Sunflower seeds",
			],
			avoid: ["Cashews", "Walnuts"],
		},
		"Drinks & Sweets": {
			safe: [
				"Herbal teas (chamomile, peppermint)",
				"Water",
				"Pure maple syrup",
				"Honey (raw, local is best)",
			],
			caution: ["Coffee (low acid)", "Fruit juices (from safe fruits)"],
			avoid: [
				"Alcohol (especially wine, beer)",
				"Black/Green tea",
				"Chocolate/Cacao",
				"Energy drinks",
				"Kombucha",
				"Soy milk",
			],
		},
	};

	function switchTab(targetId) {
		contentSections.forEach((section) => {
			section.classList.toggle("active", section.id === targetId);
		});
		navButtons.forEach((button) => {
			button.classList.toggle("active", button.dataset.target === targetId);
		});
	}

	navButtons.forEach((button) => {
		button.addEventListener("click", () => {
			switchTab(button.dataset.target);
		});
	});

	function generateFoodUI() {
		const categoriesContainer = document.getElementById("food-categories");
		const listsContainer = document.getElementById("food-lists");

		const categories = Object.keys(foodData);
		categories.forEach((category) => {
			const button = document.createElement("button");
			button.textContent = category;
			button.className =
				"px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-medium hover:bg-teal-100 hover:text-teal-800 transition";
			button.dataset.category = category;
			categoriesContainer.appendChild(button);
		});

		listsContainer.innerHTML = `
            <div id="safe-foods" class="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 class="text-lg font-semibold text-green-800 mb-3">✅ Low Histamine (Safe)</h3>
                <ul class="space-y-1 text-slate-700"></ul>
            </div>
            <div id="caution-foods" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 class="text-lg font-semibold text-yellow-800 mb-3">⚠️ Use with Caution</h3>
                <ul class="space-y-1 text-slate-700"></ul>
            </div>
            <div id="avoid-foods" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 class="text-lg font-semibold text-red-800 mb-3">🚫 High Histamine (Avoid)</h3>
                <ul class="space-y-1 text-slate-700"></ul>
            </div>
        `;

		function populateLists(category) {
			document.querySelectorAll("#food-lists ul").forEach((ul) => {
				ul.innerHTML = "";
			});
			const safeList = document.querySelector("#safe-foods ul");
			const cautionList = document.querySelector("#caution-foods ul");
			const avoidList = document.querySelector("#avoid-foods ul");

			foodData[category].safe.forEach((item) => {
				const li = document.createElement("li");
				li.textContent = item;
				li.className = "food-item";
				safeList.appendChild(li);
			});
			foodData[category].caution.forEach((item) => {
				const li = document.createElement("li");
				li.textContent = item;
				li.className = "food-item";
				cautionList.appendChild(li);
			});
			foodData[category].avoid.forEach((item) => {
				const li = document.createElement("li");
				li.textContent = item;
				li.className = "food-item";
				avoidList.appendChild(li);
			});
		}

		categoriesContainer.addEventListener("click", (e) => {
			if (e.target.tagName === "BUTTON") {
				populateLists(e.target.dataset.category);
				document
					.querySelectorAll("#food-categories button")
					.forEach((btn) => btn.classList.remove("bg-teal-500", "text-white"));
				e.target.classList.add("bg-teal-500", "text-white");
			}
		});

		populateLists("Fruits");
		categoriesContainer
			.querySelector("button")
			.classList.add("bg-teal-500", "text-white");
	}

	function handleFoodSearch() {
		const query = foodSearch.value.toLowerCase();
		const foodItems = document.querySelectorAll(".food-item");
		if (query === "") {
			foodItems.forEach((item) => item.classList.remove("hide"));
			return;
		}

		foodItems.forEach((item) => {
			const text = item.textContent.toLowerCase();
			item.classList.toggle("hide", !text.includes(query));
		});
	}

	foodSearch.addEventListener("input", handleFoodSearch);

	let histamineChartInstance;
	function renderHistamineChart() {
		const ctx = document.getElementById("histamineChart").getContext("2d");
		const chartData = {
			labels: [
				"Fermented Foods",
				"Aged/Cured Meats",
				"Aged Cheeses",
				"Leftovers",
				"Certain Veggies",
				"Certain Fruits",
				"Freshly Cooked Meats",
				"Fresh Veggies/Fruits",
			],
			datasets: [
				{
					label: "Relative Histamine Impact",
					data: [95, 90, 85, 70, 60, 55, 10, 5],
					backgroundColor: [
						"#ef4444",
						"#f97316",
						"#f59e0b",
						"#eab308",
						"#84cc16",
						"#22c55e",
						"#14b8a6",
						"#06b6d4",
					],
					borderColor: "#ffffff",
					borderWidth: 2,
				},
			],
		};

		if (histamineChartInstance) {
			histamineChartInstance.destroy();
		}

		histamineChartInstance = new Chart(ctx, {
			type: "bar",
			data: chartData,
			options: {
				indexAxis: "y",
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						backgroundColor: "#334155",
						titleFont: { size: 14 },
						bodyFont: { size: 12 },
						padding: 10,
						cornerRadius: 4,
					},
				},
				scales: {
					x: {
						beginAtZero: true,
						grid: {
							color: "#e2e8f0",
						},
						ticks: {
							display: false,
						},
					},
					y: {
						grid: {
							display: false,
						},
						ticks: {
							color: "#475569",
							font: {
								size: 12,
							},
						},
					},
				},
			},
		});
	}

	const symptomData = {
		labels: [],
		severities: [],
	};
	let symptomChartInstance;

	function renderSymptomChart() {
		const ctx = document.getElementById("symptomChart").getContext("2d");
		if (symptomChartInstance) {
			symptomChartInstance.destroy();
		}
		symptomChartInstance = new Chart(ctx, {
			type: "line",
			data: {
				labels: symptomData.labels,
				datasets: [
					{
						label: "Symptom Severity",
						data: symptomData.severities,
						fill: true,
						backgroundColor: "rgba(20, 184, 166, 0.1)",
						borderColor: "rgb(20, 184, 166)",
						tension: 0.3,
						pointBackgroundColor: "rgb(13, 118, 106)",
						pointRadius: 5,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: {
						beginAtZero: true,
						max: 10,
						ticks: {
							stepSize: 1,
						},
					},
				},
				plugins: {
					legend: {
						display: false,
					},
				},
			},
		});
	}

	const symptomForm = document.getElementById("symptomForm");
	const severitySlider = document.getElementById("symptomSeverity");
	const severityValue = document.getElementById("severityValue");
	const symptomLogContainer = document.getElementById("symptomLog");

	severitySlider.addEventListener("input", (e) => {
		severityValue.textContent = e.target.value;
	});

	symptomForm.addEventListener("submit", (e) => {
		e.preventDefault();
		const dateInput = document.getElementById("symptomDate");
		const severity = document.getElementById("symptomSeverity").value;
		const notes = document.getElementById("symptomNotes").value;

		const date = dateInput.value
			? new Date(dateInput.value).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				})
			: new Date().toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				});

		symptomData.labels.push(date);
		symptomData.severities.push(severity);

		if (symptomLogContainer.querySelector("p")) {
			symptomLogContainer.innerHTML = "";
		}

		const logEntry = document.createElement("div");
		logEntry.className = "p-3 bg-slate-100 rounded-md mb-2 text-sm";
		logEntry.innerHTML = `<p class="font-semibold text-slate-700">${date} - Severity: ${severity}/10</p><p class="text-slate-600">${notes || "No notes"}</p>`;
		symptomLogContainer.prepend(logEntry);

		renderSymptomChart();
		symptomForm.reset();
		severityValue.textContent = "5";
		const today = new Date().toISOString().split("T")[0];
		dateInput.value = today;
	});

	function initialize() {
		const today = new Date().toISOString().split("T")[0];
		document.getElementById("symptomDate").value = today;
		switchTab("overview");
		generateFoodUI();
		renderHistamineChart();
		renderSymptomChart();
	}

	initialize();
};
