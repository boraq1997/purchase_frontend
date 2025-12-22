📦 Purchase Management System – Al-Abbas Holy Shrine

The Purchase Management System is a web application built with Vue.js and uses PrimeVue (UI components), PrimeFlex (responsive layout), and FontAwesome (icons).

The system is designed to manage all purchasing processes within the organization, from creating purchase requests by departments, through approvals and material inspection, to generating detailed reports.

🔹 System Features
	1.	User Management
	•	Add, edit, and delete users.
	•	Assign permissions based on roles (Department, Committee, Warehouse, Admin).
	2.	Department Management
	•	Departments can create purchase requests.
	•	Each request contains detailed items: name, quantity, description, priority.
	3.	Approval Workflow
	•	The responsible committee reviews requests and approves or rejects them.
	4.	Needs Assessment Committee
	•	Reviews each request and provides feedback on necessity.
	5.	Warehouse Committee
	•	Checks available stock and updates request status based on inventory.
	6.	Price Quotations
	•	Add multiple supplier quotations for each item.
	•	Compare and select the best prices.
	7.	Request Reports
	•	Generate detailed reports for each purchase request.
	•	Print or export reports in different formats (PDF, etc.).

⸻

🔹 Technologies Used
	•	Vue.js 3: Frontend framework for building interactive UI.
	•	PrimeVue: Ready-to-use UI components (DataTable, Forms, Buttons).
	•	PrimeFlex: Flexible grid and responsive layout.
	•	FontAwesome: Icons for buttons and sections.
	•	Axios: API requests handling.
	•	Vuex / Pinia: State management across components.

⸻

🔹 Features
	•	Modern and user-friendly interface.
	•	Role-based access control.
	•	Multi-level approval workflow for purchase requests.
	•	Track inventory for each item.
	•	Generate, print, and export detailed reports.
	•	Responsive design for all devices.

____

🔹 Local Setup

# Install dependencies
npm install

# Run the project in development mode
npm run serve

# Build the project for production
npm run build
After running, the application will be accessible at: http://localhost:8080/




🔹 Contribution Guidelines
	1.	Open an issue for feature requests or bug reports.
	2.	Fork the repository.
	3.	Create a new branch for your feature or fix: git checkout -b feature/your-feature.
	4.	Submit a Pull Request for review.

⸻

🔹 License

This project is intended for internal use within Al-Abbas Holy Shrine.
Please do not redistribute or publish without official permission.
