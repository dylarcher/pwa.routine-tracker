// app.js

// IndexedDB setup
const DB_NAME = "MCAS_Health_DB";
const DB_VERSION = 1; // Increment this for schema migrations
let db;

// Function to open and initialize the IndexedDB database
function openDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			db = event.target.result;
			console.log("IndexedDB: Upgrade needed. Creating object stores...");

			// Create object stores if they don't exist
			if (!db.objectStoreNames.contains("symptom_logs")) {
				const symptomStore = db.createObjectStore("symptom_logs", {
					keyPath: "log_id",
					autoIncrement: true,
				});
				symptomStore.createIndex("user_id", "user_id", { unique: false });
				symptomStore.createIndex("timestamp", "timestamp", { unique: false });
				symptomStore.createIndex("symptom_type", "symptom_type", {
					unique: false,
				});
				symptomStore.createIndex("severity", "severity", { unique: false });
			}
			if (!db.objectStoreNames.contains("dietary_logs")) {
				const dietStore = db.createObjectStore("dietary_logs", {
					keyPath: "meal_id",
					autoIncrement: true,
				});
				dietStore.createIndex("user_id", "user_id", { unique: false });
				dietStore.createIndex("timestamp", "timestamp", { unique: false });
				dietStore.createIndex("meal_type", "meal_type", { unique: false });
			}
			if (!db.objectStoreNames.contains("mood_entries")) {
				const moodStore = db.createObjectStore("mood_entries", {
					keyPath: "mood_id",
					autoIncrement: true,
				});
				moodStore.createIndex("user_id", "user_id", { unique: false });
				moodStore.createIndex("timestamp", "timestamp", { unique: false });
				moodStore.createIndex("emotional_state", "emotional_state", {
					unique: false,
				});
				moodStore.createIndex("severity", "severity", { unique: false });
			}
			if (!db.objectStoreNames.contains("sleep_records")) {
				const sleepStore = db.createObjectStore("sleep_records", {
					keyPath: "sleep_id",
					autoIncrement: true,
				});
				sleepStore.createIndex("user_id", "user_id", { unique: false });
				sleepStore.createIndex("start_time", "start_time", { unique: false });
				sleepStore.createIndex("end_time", "end_time", { unique: false });
				sleepStore.createIndex("quality", "quality", { unique: false });
			}
			// For a real app, 'users' and 'attachments' would also be created.
			// For simplicity, we'll assume a single user for this demo and no direct attachment storage.
			console.log("IndexedDB: Object stores created/updated.");
		};

		request.onsuccess = (event) => {
			db = event.target.result;
			console.log("IndexedDB: Database opened successfully.");
			resolve(db);
		};

		request.onerror = (event) => {
			console.error("IndexedDB: Database error:", event.target.errorCode);
			showMessageModal(
				"Database Error",
				"Could not open the local database. Some features may not work offline.",
			);
			reject(event.target.error);
		};
	});
}

// Generic function to add data to an IndexedDB object store
async function addData(storeName, data) {
	if (!db) {
		await openDatabase(); // Ensure DB is open before operations
	}
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], "readwrite");
		const store = transaction.objectStore(storeName);
		const request = store.add(data);

		request.onsuccess = () => {
			console.log(`Data added to ${storeName}:`, data);
			resolve(request.result);
		};

		request.onerror = (event) => {
			console.error(`Error adding data to ${storeName}:`, event.target.error);
			showMessageModal(
				"Error Saving Data",
				`Could not save your data to ${storeName}.`,
			);
			reject(event.target.error);
		};
	});
}

// Generic function to get all data from an IndexedDB object store
async function getAllData(storeName) {
	if (!db) {
		await openDatabase();
	}
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], "readonly");
		const store = transaction.objectStore(storeName);
		const request = store.getAll();

		request.onsuccess = () => {
			console.log(`Retrieved all data from ${storeName}.`);
			resolve(request.result);
		};

		request.onerror = (event) => {
			console.error(
				`Error retrieving data from ${storeName}:`,
				event.target.error,
			);
			showMessageModal(
				"Error Loading Data",
				`Could not load data from ${storeName}.`,
			);
			reject(event.target.error);
		};
	});
}

// --- UI and Event Handlers ---

// Message Modal Functions
const messageModal = document.getElementById("message-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalCloseBtn = document.getElementById("modal-close-btn");

function showMessageModal(title, message) {
	modalTitle.textContent = title;
	modalMessage.textContent = message;
	messageModal.classList.remove("hidden");
}

modalCloseBtn.addEventListener("click", () => {
	messageModal.classList.add("hidden");
});

// Navigation
const navButtons = document.querySelectorAll("nav button");
const sections = document.querySelectorAll(".page-section");

function showSection(sectionId) {
	sections.forEach((section) => {
		section.classList.remove("active-section");
	});
	document.getElementById(sectionId).classList.add("active-section");

	navButtons.forEach((button) => {
		button.classList.remove("text-blue-600", "border-blue-600");
		button.classList.add("text-gray-600", "border-gray-200");
	});
	const activeButton = document.getElementById(
		`nav-${sectionId.replace("-section", "")}`,
	);
	if (activeButton) {
		activeButton.classList.add("text-blue-600", "border-blue-600");
		activeButton.classList.remove("text-gray-600", "border-gray-200");
	}

	// Refresh display for the active section
	if (sectionId === "symptoms-section") renderSymptomLogs();
	if (sectionId === "diet-section") renderDietaryLogs();
	if (sectionId === "mood-section") renderMoodEntries();
	if (sectionId === "sleep-section") renderSleepRecords();
}

navButtons.forEach((button) => {
	button.addEventListener("click", (event) => {
		const sectionId = event.target.id.replace("nav-", "") + "-section";
		showSection(sectionId);
	});
});

// Set initial section based on URL hash or default to symptoms
window.addEventListener("DOMContentLoaded", async () => {
	await openDatabase(); // Open DB when DOM is ready

	const urlParams = new URLSearchParams(window.location.search);
	const initialSection = urlParams.get("section") || "symptoms";
	showSection(`${initialSection}-section`);

	// Set current datetime for datetime-local inputs
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, "0");
	const day = now.getDate().toString().padStart(2, "0");
	const hours = now.getHours().toString().padStart(2, "0");
	const minutes = now.getMinutes().toString().padStart(2, "0");
	const currentDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;

	document.getElementById("symptom-timestamp").value = currentDatetime;
	document.getElementById("diet-timestamp").value = currentDatetime;
	document.getElementById("mood-timestamp").value = currentDatetime;
	document.getElementById("sleep-start-time").value = currentDatetime; // Start time for sleep
	// Sleep end time can be set to current + 8 hours as a suggestion
	const eightHoursLater = new Date(now.getTime() + 8 * 60 * 60 * 1000);
	const endHours = eightHoursLater.getHours().toString().padStart(2, "0");
	const endMinutes = eightHoursLater.getMinutes().toString().padStart(2, "0");
	const endDatetime = `${year}-${month}-${day}T${endHours}:${endMinutes}`;
	document.getElementById("sleep-end-time").value = endDatetime;
});

// --- Form Submissions ---

// Symptom Form
document
	.getElementById("symptom-form")
	.addEventListener("submit", async (event) => {
		event.preventDefault();
		const form = event.target;
		const formData = new FormData(form);
		const symptomLog = {
			user_id: "default_user", // Placeholder for user ID
			timestamp: formData.get("timestamp"),
			symptom_type: formData.get("symptomType"),
			severity: parseInt(formData.get("severity")),
			duration_minutes: formData.get("durationMinutes")
				? parseInt(formData.get("durationMinutes"))
				: null,
			location: formData.get("location") || "", // Not in form, but in schema. Add if needed.
			description: formData.get("description") || "", // Not in form, but in schema. Add if needed.
			associated_triggers: formData
				.get("associatedTriggers")
				.split(",")
				.map((t) => t.trim())
				.filter((t) => t),
			relief_measures: formData.get("reliefMeasures") || "",
			photos: [], // Placeholder for photo IDs
		};

		try {
			await addData("symptom_logs", symptomLog);
			form.reset();
			// Reset datetime-local input after reset
			const now = new Date();
			const year = now.getFullYear();
			const month = (now.getMonth() + 1).toString().padStart(2, "0");
			const day = now.getDate().toString().padStart(2, "0");
			const hours = now.getHours().toString().padStart(2, "0");
			const minutes = now.getMinutes().toString().padStart(2, "0");
			document.getElementById("symptom-timestamp").value =
				`${year}-${month}-${day}T${hours}:${minutes}`;

			showMessageModal("Success!", "Symptom log added successfully.");
			renderSymptomLogs(); // Refresh display
		} catch (error) {
			console.error("Failed to add symptom log:", error);
		}
	});

// Diet Form
document
	.getElementById("diet-form")
	.addEventListener("submit", async (event) => {
		event.preventDefault();
		const form = event.target;
		const formData = new FormData(form);
		const dietLog = {
			user_id: "default_user",
			timestamp: formData.get("timestamp"),
			meal_type: formData.get("mealType"),
			foods: formData
				.get("foods")
				.split(",")
				.map((f) => ({
					name: f.trim(),
					quantity: "",
					components: [],
					preparation: "",
				}))
				.filter((f) => f.name),
			perceived_histamine_level: formData.get("perceivedHistamineLevel"),
			notes: formData.get("notes"),
		};

		try {
			await addData("dietary_logs", dietLog);
			form.reset();
			const now = new Date();
			const year = now.getFullYear();
			const month = (now.getMonth() + 1).toString().padStart(2, "0");
			const day = now.getDate().toString().padStart(2, "0");
			const hours = now.getHours().toString().padStart(2, "0");
			const minutes = now.getMinutes().toString().padStart(2, "0");
			document.getElementById("diet-timestamp").value =
				`${year}-${month}-${day}T${hours}:${minutes}`;

			showMessageModal("Success!", "Diet log added successfully.");
			renderDietaryLogs(); // Refresh display
		} catch (error) {
			console.error("Failed to add diet log:", error);
		}
	});

// Mood Form
document
	.getElementById("mood-form")
	.addEventListener("submit", async (event) => {
		event.preventDefault();
		const form = event.target;
		const formData = new FormData(form);
		const moodEntry = {
			user_id: "default_user",
			timestamp: formData.get("timestamp"),
			emotional_state: formData.get("emotionalState"),
			severity: parseInt(formData.get("severity")),
			cognitive_symptoms: formData
				.get("cognitiveSymptoms")
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s),
			psychosocial_stressors: formData
				.get("psychosocialStressors")
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s),
			notes: formData.get("notes"),
		};

		try {
			await addData("mood_entries", moodEntry);
			form.reset();
			const now = new Date();
			const year = now.getFullYear();
			const month = (now.getMonth() + 1).toString().padStart(2, "0");
			const day = now.getDate().toString().padStart(2, "0");
			const hours = now.getHours().toString().padStart(2, "0");
			const minutes = now.getMinutes().toString().padStart(2, "0");
			document.getElementById("mood-timestamp").value =
				`${year}-${month}-${day}T${hours}:${minutes}`;

			showMessageModal("Success!", "Mood entry added successfully.");
			renderMoodEntries(); // Refresh display
		} catch (error) {
			console.error("Failed to add mood entry:", error);
		}
	});

// Sleep Form
document
	.getElementById("sleep-form")
	.addEventListener("submit", async (event) => {
		event.preventDefault();
		const form = event.target;
		const formData = new FormData(form);
		const sleepRecord = {
			user_id: "default_user",
			start_time: formData.get("startTime"),
			end_time: formData.get("endTime"),
			duration_hours: null, // Will calculate this
			quality: parseInt(formData.get("quality")),
			disturbances: formData
				.get("disturbances")
				.split(",")
				.map((d) => d.trim())
				.filter((d) => d),
			sleep_stages: {}, // Placeholder for detailed sleep stages
			notes: formData.get("notes"),
		};

		// Calculate duration in hours
		const start = new Date(sleepRecord.start_time);
		const end = new Date(sleepRecord.end_time);
		if (start && end && end > start) {
			sleepRecord.duration_hours =
				(end.getTime() - start.getTime()) / (1000 * 60 * 60);
		}

		try {
			await addData("sleep_records", sleepRecord);
			form.reset();
			const now = new Date();
			const year = now.getFullYear();
			const month = (now.getMonth() + 1).toString().padStart(2, "0");
			const day = now.getDate().toString().padStart(2, "0");
			const hours = now.getHours().toString().padStart(2, "0");
			const minutes = now.getMinutes().toString().padStart(2, "0");
			document.getElementById("sleep-start-time").value =
				`${year}-${month}-${day}T${hours}:${minutes}`;
			const eightHoursLater = new Date(now.getTime() + 8 * 60 * 60 * 1000);
			const endHours = eightHoursLater.getHours().toString().padStart(2, "0");
			const endMinutes = eightHoursLater
				.getMinutes()
				.toString()
				.padStart(2, "0");
			document.getElementById("sleep-end-time").value =
				`${year}-${month}-${day}T${endHours}:${endMinutes}`;

			showMessageModal("Success!", "Sleep record added successfully.");
			renderSleepRecords(); // Refresh display
		} catch (error) {
			console.error("Failed to add sleep record:", error);
		}
	});

// --- Data Display Functions ---

async function renderSymptomLogs() {
	const displayDiv = document.getElementById("symptom-logs-display");
	displayDiv.innerHTML = ""; // Clear previous logs
	try {
		const logs = await getAllData("symptom_logs");
		if (logs.length === 0) {
			displayDiv.innerHTML =
				'<p class="text-gray-500 text-center">No symptom logs yet. Add one above!</p>';
			return;
		}
		// Sort by timestamp descending
		logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		logs.forEach((log) => {
			const logElement = document.createElement("div");
			logElement.className =
				"bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200";
			logElement.innerHTML = `
                <p class="text-sm text-gray-500">${new Date(log.timestamp).toLocaleString()}</p>
                <h4 class="text-lg font-semibold text-gray-800">${log.symptom_type} (Severity: ${log.severity}/10)</h4>
                ${log.duration_minutes ? `<p class="text-gray-600">Duration: ${log.duration_minutes} mins</p>` : ""}
                ${log.associated_triggers && log.associated_triggers.length > 0 ? `<p class="text-gray-600">Triggers: ${log.associated_triggers.join(", ")}</p>` : ""}
                ${log.relief_measures ? `<p class="text-gray-600">Relief: ${log.relief_measures}</p>` : ""}
            `;
			displayDiv.appendChild(logElement);
		});
	} catch (error) {
		displayDiv.innerHTML =
			'<p class="text-red-500 text-center">Error loading symptom logs.</p>';
		console.error("Error rendering symptom logs:", error);
	}
}

async function renderDietaryLogs() {
	const displayDiv = document.getElementById("diet-logs-display");
	displayDiv.innerHTML = ""; // Clear previous logs
	try {
		const logs = await getAllData("dietary_logs");
		if (logs.length === 0) {
			displayDiv.innerHTML =
				'<p class="text-gray-500 text-center">No dietary logs yet. Add one above!</p>';
			return;
		}
		logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		logs.forEach((log) => {
			const foodList = log.foods.map((f) => f.name).join(", ");
			const logElement = document.createElement("div");
			logElement.className =
				"bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200";
			logElement.innerHTML = `
                <p class="text-sm text-gray-500">${new Date(log.timestamp).toLocaleString()} - ${log.meal_type}</p>
                <h4 class="text-lg font-semibold text-gray-800">Foods: ${foodList}</h4>
                <p class="text-gray-600">Histamine Level: ${log.perceived_histamine_level}</p>
                ${log.notes ? `<p class="text-gray-600">Notes: ${log.notes}</p>` : ""}
            `;
			displayDiv.appendChild(logElement);
		});
	} catch (error) {
		displayDiv.innerHTML =
			'<p class="text-red-500 text-center">Error loading dietary logs.</p>';
		console.error("Error rendering dietary logs:", error);
	}
}

async function renderMoodEntries() {
	const displayDiv = document.getElementById("mood-logs-display");
	displayDiv.innerHTML = ""; // Clear previous logs
	try {
		const logs = await getAllData("mood_entries");
		if (logs.length === 0) {
			displayDiv.innerHTML =
				'<p class="text-gray-500 text-center">No mood entries yet. Add one above!</p>';
			return;
		}
		logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		logs.forEach((log) => {
			const logElement = document.createElement("div");
			logElement.className =
				"bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200";
			logElement.innerHTML = `
                <p class="text-sm text-gray-500">${new Date(log.timestamp).toLocaleString()}</p>
                <h4 class="text-lg font-semibold text-gray-800">Mood: ${log.emotional_state} (Severity: ${log.severity}/10)</h4>
                ${log.cognitive_symptoms && log.cognitive_symptoms.length > 0 ? `<p class="text-gray-600">Cognitive: ${log.cognitive_symptoms.join(", ")}</p>` : ""}
                ${log.psychosocial_stressors && log.psychosocial_stressors.length > 0 ? `<p class="text-gray-600">Stressors: ${log.psychosocial_stressors.join(", ")}</p>` : ""}
                ${log.notes ? `<p class="text-gray-600">Notes: ${log.notes}</p>` : ""}
            `;
			displayDiv.appendChild(logElement);
		});
	} catch (error) {
		displayDiv.innerHTML =
			'<p class="text-red-500 text-center">Error loading mood entries.</p>';
		console.error("Error rendering mood entries:", error);
	}
}

async function renderSleepRecords() {
	const displayDiv = document.getElementById("sleep-logs-display");
	displayDiv.innerHTML = ""; // Clear previous logs
	try {
		const logs = await getAllData("sleep_records");
		if (logs.length === 0) {
			displayDiv.innerHTML =
				'<p class="text-gray-500 text-center">No sleep records yet. Add one above!</p>';
			return;
		}
		logs.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

		logs.forEach((log) => {
			const logElement = document.createElement("div");
			logElement.className =
				"bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200";
			logElement.innerHTML = `
                <p class="text-sm text-gray-500">From ${new Date(log.start_time).toLocaleString()} to ${new Date(log.end_time).toLocaleString()}</p>
                <h4 class="text-lg font-semibold text-gray-800">Sleep Quality: ${log.quality}/5</h4>
                ${log.duration_hours ? `<p class="text-gray-600">Duration: ${log.duration_hours.toFixed(1)} hours</p>` : ""}
                ${log.disturbances && log.disturbances.length > 0 ? `<p class="text-gray-600">Disturbances: ${log.disturbances.join(", ")}</p>` : ""}
                ${log.notes ? `<p class="text-gray-600">Notes: ${log.notes}</p>` : ""}
            `;
			displayDiv.appendChild(logElement);
		});
	} catch (error) {
		displayDiv.innerHTML =
			'<p class="text-red-500 text-center">Error loading sleep records.</p>';
		console.error("Error rendering sleep records:", error);
	}
}

// --- Report Generation and Export ---

// Helper to convert array of objects to CSV string
function convertToCSV(data, headers) {
	if (!data || data.length === 0) return "";

	// Use provided headers or derive from first object keys
	const actualHeaders = headers || Object.keys(data[0]);
	const csvRows = [];

	// Add header row
	csvRows.push(actualHeaders.join(","));

	// Add data rows
	for (const row of data) {
		const values = actualHeaders.map((header) => {
			let value = row[header];
			if (Array.isArray(value)) {
				value = value.join(";"); // Join array elements with a semicolon
			} else if (typeof value === "object" && value !== null) {
				value = JSON.stringify(value); // Stringify nested objects
			}
			// Handle commas and newlines in values by enclosing in quotes
			if (
				typeof value === "string" &&
				(value.includes(",") || value.includes("\n") || value.includes('"'))
			) {
				return `"${value.replace(/"/g, '""')}"`; // Escape double quotes
			}
			return value;
		});
		csvRows.push(values.join(","));
	}
	return csvRows.join("\n");
}

// Function to download CSV
function downloadCSV(csvString, filename) {
	const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	if (link.download !== undefined) {
		// Feature detection for download attribute
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", filename);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showMessageModal("Export Complete", `${filename} downloaded successfully!`);
	} else {
		showMessageModal(
			"Export Failed",
			"Your browser does not support direct CSV download.",
		);
	}
}

document
	.getElementById("export-symptoms-csv")
	.addEventListener("click", async () => {
		try {
			const symptoms = await getAllData("symptom_logs");
			if (symptoms.length === 0) {
				showMessageModal("No Data", "No symptom logs to export.");
				return;
			}
			const headers = [
				"log_id",
				"user_id",
				"timestamp",
				"symptom_type",
				"severity",
				"duration_minutes",
				"location",
				"description",
				"associated_triggers",
				"relief_measures",
				"photos",
			];
			const csv = convertToCSV(symptoms, headers);
			downloadCSV(csv, "mcas_symptoms_log.csv");
		} catch (error) {
			console.error("Error exporting symptoms:", error);
			showMessageModal("Export Error", "Failed to export symptom data.");
		}
	});

document
	.getElementById("export-diet-csv")
	.addEventListener("click", async () => {
		try {
			const dietLogs = await getAllData("dietary_logs");
			if (dietLogs.length === 0) {
				showMessageModal("No Data", "No dietary logs to export.");
				return;
			}
			// Flatten foods array for CSV export
			const flattenedDietLogs = dietLogs.map((log) => ({
				...log,
				foods: log.foods.map((f) => f.name).join("; "), // Join food names for CSV
			}));
			const headers = [
				"meal_id",
				"user_id",
				"timestamp",
				"meal_type",
				"foods",
				"perceived_histamine_level",
				"notes",
			];
			const csv = convertToCSV(flattenedDietLogs, headers);
			downloadCSV(csv, "mcas_diet_log.csv");
		} catch (error) {
			console.error("Error exporting diet:", error);
			showMessageModal("Export Error", "Failed to export diet data.");
		}
	});

document
	.getElementById("export-mood-csv")
	.addEventListener("click", async () => {
		try {
			const moodEntries = await getAllData("mood_entries");
			if (moodEntries.length === 0) {
				showMessageModal("No Data", "No mood entries to export.");
				return;
			}
			const headers = [
				"mood_id",
				"user_id",
				"timestamp",
				"emotional_state",
				"severity",
				"cognitive_symptoms",
				"psychosocial_stressors",
				"notes",
			];
			const csv = convertToCSV(moodEntries, headers);
			downloadCSV(csv, "mcas_mood_log.csv");
		} catch (error) {
			console.error("Error exporting mood:", error);
			showMessageModal("Export Error", "Failed to export mood data.");
		}
	});

document
	.getElementById("export-sleep-csv")
	.addEventListener("click", async () => {
		try {
			const sleepRecords = await getAllData("sleep_records");
			if (sleepRecords.length === 0) {
				showMessageModal("No Data", "No sleep records to export.");
				return;
			}
			const headers = [
				"sleep_id",
				"user_id",
				"start_time",
				"end_time",
				"duration_hours",
				"quality",
				"disturbances",
				"sleep_stages",
				"notes",
			];
			const csv = convertToCSV(sleepRecords, headers);
			downloadCSV(csv, "mcas_sleep_log.csv");
		} catch (error) {
			console.error("Error exporting sleep:", error);
			showMessageModal("Export Error", "Failed to export sleep data.");
		}
	});

// Web Share API (for sharing current view/report)
document
	.getElementById("share-report-btn")
	.addEventListener("click", async () => {
		if (navigator.share) {
			try {
				// You can customize what to share based on the current active section or a generated report
				const activeSectionId = document.querySelector(".active-section").id;
				let shareText = `MCAS Tracker: My ${activeSectionId.replace("-section", "")} Log`;
				let shareUrl =
					window.location.origin +
					window.location.pathname +
					`?section=${activeSectionId.replace("-section", "")}`;

				// In a real app, you might generate a summary string or a temporary PDF/CSV here
				// For this demo, we'll just share a generic text and the app URL
				await navigator.share({
					title: "MCAS Tracker Data",
					text: shareText,
					url: shareUrl,
				});
				showMessageModal("Share Successful", "Content shared successfully!");
			} catch (error) {
				if (error.name === "AbortError") {
					console.log("Share cancelled by user.");
				} else {
					console.error("Error sharing:", error);
					showMessageModal(
						"Share Error",
						"Could not share content. Please try again.",
					);
				}
			}
		} else {
			showMessageModal(
				"Feature Not Supported",
				"Web Share API is not supported in your browser/device.",
			);
			console.log("Web Share API not supported.");
		}
	});

// Placeholder for Notification Permission Request (would be triggered by user action)
function requestNotificationPermission() {
	if ("Notification" in window) {
		Notification.requestPermission().then((permission) => {
			if (permission === "granted") {
				console.log("Notification permission granted.");
				// You can now send notifications
				// sendTestNotification(); // Example: send a test notification
			} else {
				console.warn("Notification permission denied.");
				showMessageModal(
					"Permission Denied",
					"Notification permission was denied. You will not receive reminders.",
				);
			}
		});
	} else {
		console.warn("Notifications not supported in this browser.");
		showMessageModal(
			"Not Supported",
			"Notifications are not supported in your browser.",
		);
	}
}

// Example of sending a notification (would be triggered by a reminder system)
function sendTestNotification() {
	if (Notification.permission === "granted") {
		new Notification("MCAS Tracker Reminder", {
			body: "Don't forget to log your symptoms today!",
			icon: "/icons/icon-192x192.png",
		});
	}
}

// You might trigger permission request on a dedicated settings page or first interaction
// For demo purposes, not automatically requesting on load.
// document.getElementById('request-notification-permission-btn').addEventListener('click', requestNotificationPermission); // If you add a button for this
