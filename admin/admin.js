/* =========================================================
   JRSU FRESHER'S PARTY 2026
   ADMIN DASHBOARD
========================================================= */

"use strict";


/* =========================================================
   API
========================================================= */

const API_BASE = "/api";


/* =========================================================
   SESSION
========================================================= */

const ADMIN_SESSION_KEY =
    "JRSU_ADMIN_SESSION";


let currentAdmin = null;

let allRegistrations = [];

let isLoadingRegistrations = false;

let lastFilterState = "";


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkAdminSession();

    }
);


/* =========================================================
   CHECK ADMIN SESSION
========================================================= */

function checkAdminSession() {

    const saved =
        sessionStorage.getItem(
            ADMIN_SESSION_KEY
        );


    if (!saved) {

        showLoginPage();

        return;

    }


    try {

        currentAdmin =
            JSON.parse(
                saved
            );


        if (
            !currentAdmin ||
            !currentAdmin.name ||
            !currentAdmin.id
        ) {

            sessionStorage.removeItem(
                ADMIN_SESSION_KEY
            );

            currentAdmin =
                null;

            showLoginPage();

            return;

        }


        showDashboard();

        loadRegistrations();

        loadActivityLogs();

    }
    catch (error) {

        console.error(
            "Session error:",
            error
        );


        sessionStorage.removeItem(
            ADMIN_SESSION_KEY
        );


        currentAdmin =
            null;


        showLoginPage();

    }

}


/* =========================================================
   LOGIN PAGE
========================================================= */

function showLoginPage() {

    const loginPage =
        document.getElementById(
            "adminLoginPage"
        );


    const dashboard =
        document.getElementById(
            "dashboard"
        );


    if (loginPage) {

        loginPage.style.display =
            "flex";

    }


    if (dashboard) {

        dashboard.style.display =
            "none";

        dashboard.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function showDashboard() {

    const loginPage =
        document.getElementById(
            "adminLoginPage"
        );


    const dashboard =
        document.getElementById(
            "dashboard"
        );


    if (loginPage) {

        loginPage.style.display =
            "none";

    }


    if (dashboard) {

        dashboard.style.display =
            "block";

        dashboard.classList.add(
            "show"
        );

    }


    showCurrentAdmin();

}


/* =========================================================
   CURRENT ADMIN
========================================================= */

function showCurrentAdmin() {

    const element =
        document.getElementById(
            "loggedInAdminName"
        );


    if (!element) {

        return;

    }


    if (!currentAdmin) {

        element.textContent =
            "👤 Admin";

        return;

    }


    element.textContent =
        "👤 " +
        currentAdmin.name;

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

async function adminLogin() {

    const nameInput =
        document.getElementById(
            "adminName"
        );


    const idInput =
        document.getElementById(
            "loginId"
        );


    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    const errorBox =
        document.getElementById(
            "loginError"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const id =
        idInput
            ? idInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (errorBox) {

        errorBox.textContent =
            "";

    }


    if (!name) {

        showLoginError(
            "Please enter your name."
        );

        return;

    }


    if (!id) {

        showLoginError(
            "Please enter Admin ID."
        );

        return;

    }


    if (!password) {

        showLoginError(
            "Please enter password."
        );

        return;

    }


    try {

        const response =
            await fetch(
                API_BASE +
                "/admin/login",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            name:
                                name,

                            id:
                                id,

                            password:
                                password

                        })

                }
            );


        const text =
            await response.text();


        let result =
            {};


        if (text.trim()) {

            try {

                result =
                    JSON.parse(
                        text
                    );

            }
            catch (error) {

                console.error(
                    "Invalid server response:",
                    text
                );


                throw new Error(
                    "Backend returned an invalid response."
                );

            }

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Invalid Admin ID or Password."
            );

        }


        if (
            result.success ===
            false
        ) {

            throw new Error(
                result.message ||
                "Login failed."
            );

        }


        currentAdmin = {

            name:
                result.admin &&
                result.admin.name
                    ? result.admin.name
                    : name,

            id:
                result.admin &&
                result.admin.id
                    ? result.admin.id
                    : id,

            loginTime:
                new Date().toISOString()

        };


        sessionStorage.setItem(
            ADMIN_SESSION_KEY,
            JSON.stringify(
                currentAdmin
            )
        );


        showDashboard();


        if (passwordInput) {

            passwordInput.value =
                "";

        }


        await loadRegistrations();

        await loadActivityLogs();

    }
    catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        showLoginError(
            error.message ||
            "Unable to login."
        );

    }

}


/* =========================================================
   LOGIN ERROR
========================================================= */

function showLoginError(
    message
) {

    const errorBox =
        document.getElementById(
            "loginError"
        );


    if (errorBox) {

        errorBox.textContent =
            "❌ " +
            message;

    }

}


/* =========================================================
   LOAD REGISTRATIONS
========================================================= */

async function loadRegistrations() {

    if (
        isLoadingRegistrations
    ) {

        return;

    }


    isLoadingRegistrations =
        true;


    const table =
        document.getElementById(
            "registrationTable"
        );


    try {

        const response =
            await fetch(
                API_BASE +
                "/admin/registrations",
                {

                    method:
                        "GET",

                    cache:
                        "no-store"

                }
            );


        const text =
            await response.text();


        let result =
            {};


        if (text.trim()) {

            try {

                result =
                    JSON.parse(
                        text
                    );

            }
            catch (error) {

                throw new Error(
                    "Backend returned invalid registration data."
                );

            }

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load registrations."
            );

        }


        allRegistrations =
            Array.isArray(
                result.registrations
            )
                ? result.registrations
                : [];


        updateStatistics();

        updateDepartmentFilter();

        renderFilteredTable();

        updateLastUpdated();


        /*
           Log access only after
           records have loaded.
        */

        await logActivity({

            action:
                "ACCESS",

            description:
                "Admin accessed registration records.",

            recordCount:
                allRegistrations.length

        });

    }
    catch (error) {

        console.error(
            "Registration loading error:",
            error
        );


        if (table) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="10"
                        class="empty-table"
                    >

                        ❌ Unable to load registrations.

                        <br><br>

                        ${escapeHTML(
                            error.message
                        )}

                    </td>

                </tr>

            `;

        }

    }
    finally {

        isLoadingRegistrations =
            false;

    }

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        allRegistrations.length;


    const yes =
        allRegistrations.filter(
            function (item) {

                return String(
                    item.attendance ||
                    ""
                )
                    .toLowerCase() ===
                    "yes";

            }
        ).length;


    const no =
        allRegistrations.filter(
            function (item) {

                return String(
                    item.attendance ||
                    ""
                )
                    .toLowerCase() ===
                    "no";

            }
        ).length;


    setText(
        "totalCount",
        total
    );


    setText(
        "yesCount",
        yes
    );


    setText(
        "noCount",
        no
    );

}
/* =========================================================
   DEPARTMENT FILTER
========================================================= */

function updateDepartmentFilter() {

    const select =
        document.getElementById(
            "departmentFilter"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    const departments =
        [
            ...new Set(
                allRegistrations
                    .map(
                        function(item) {

                            return String(
                                item.department ||
                                ""
                            ).trim();

                        }
                    )
                    .filter(
                        Boolean
                    )
            )
        ]
        .sort(
            function(a, b) {

                return a.localeCompare(
                    b
                );

            }
        );


    select.innerHTML = `

        <option value="">
            All Departments
        </option>

    `;


    departments.forEach(
        function(department) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                department;


            option.textContent =
                department;


            select.appendChild(
                option
            );

        }
    );


    if (
        departments.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


/* =========================================================
   FILTER REGISTRATIONS
========================================================= */

function getFilteredRegistrations() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );


    const attendanceFilter =
        document.getElementById(
            "attendanceFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const department =
        departmentFilter
            ? departmentFilter.value
            : "";


    const attendance =
        attendanceFilter
            ? attendanceFilter.value
            : "";


    return allRegistrations.filter(
        function(item) {

            const searchableText = [

                item.serialNumber,

                item.token,

                item.name,

                item.department,

                item.departmentCode,

                item.semester,

                item.attendance,

                item.reason

            ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(
                    search
                );


            const matchesDepartment =
                !department ||
                item.department ===
                    department;


            const matchesAttendance =
                !attendance ||
                item.attendance ===
                    attendance;


            return (
                matchesSearch &&
                matchesDepartment &&
                matchesAttendance
            );

        }
    );

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderFilteredTable() {

    const records =
        getFilteredRegistrations();


    renderRegistrationTable(
        records
    );


    updateFilteredCount(
        records.length
    );

}


/* =========================================================
   REGISTRATION TABLE
========================================================= */

function renderRegistrationTable(
    records
) {

    const tbody =
        document.getElementById(
            "registrationTable"
        );


    if (!tbody) {

        return;

    }


    if (
        !records.length
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-table"
                >

                    <div
                        style="
                            padding:30px;
                            text-align:center;
                        "
                    >

                        <div
                            style="
                                font-size:42px;
                                margin-bottom:10px;
                            "
                        >
                            📭
                        </div>

                        <div>
                            No registrations found.
                        </div>

                    </div>

                </td>

            </tr>

        `;


        return;

    }


    tbody.innerHTML =
        records
            .map(
                function(item, index) {

                    return `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    item.serialNumber ??
                                    index + 1
                                )}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        item.token ||
                                        "-"
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.name ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.department ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.departmentCode ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.semester ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${attendanceBadge(
                                    item.attendance
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.reason ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.submittedAt ||
                                    formatDate(
                                        item.submittedAtISO
                                    ) ||
                                    "-"
                                )}
                            </td>

                            <td>

                                <div
                                    class="action-buttons"
                                >

                                    <button
                                        type="button"
                                        class="view-btn"
                                        onclick="viewRegistration('${escapeJS(
                                            item.token ||
                                            ""
                                        )}')"
                                    >
                                        👁️
                                    </button>

                                    <button
                                        type="button"
                                        class="delete-btn"
                                        onclick="deleteRegistration('${escapeJS(
                                            item.token ||
                                            ""
                                        )}')"
                                    >
                                        🗑️
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   ATTENDANCE BADGE
========================================================= */

function attendanceBadge(
    attendance
) {

    const value =
        String(
            attendance ||
            ""
        );


    if (
        value === "Yes"
    ) {

        return `
            <span
                class="attendance-badge yes"
            >
                ✅ Yes
            </span>
        `;

    }


    if (
        value === "No"
    ) {

        return `
            <span
                class="attendance-badge no"
            >
                ❌ No
            </span>
        `;

    }


    return `
        <span
            class="attendance-badge"
        >
            -
        </span>
    `;

}


/* =========================================================
   FILTER EVENT
========================================================= */

function applyFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );


    const attendanceFilter =
        document.getElementById(
            "attendanceFilter"
        );


    const state = [

        searchInput
            ? searchInput.value
            : "",

        departmentFilter
            ? departmentFilter.value
            : "",

        attendanceFilter
            ? attendanceFilter.value
            : ""

    ].join("|");


    renderFilteredTable();


    if (
        state !==
        lastFilterState
    ) {

        lastFilterState =
            state;


        logActivity({

            action:
                "FILTER",

            search:
                searchInput
                    ? searchInput.value.trim()
                    : "",

            description:
                "Admin filtered registration records."

        });

    }

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );


    const attendanceFilter =
        document.getElementById(
            "attendanceFilter"
        );


    if (searchInput) {

        searchInput.value =
            "";

    }


    if (departmentFilter) {

        departmentFilter.value =
            "";

    }


    if (attendanceFilter) {

        attendanceFilter.value =
            "";

    }


    lastFilterState =
        "";


    renderFilteredTable();

}


/* =========================================================
   UPDATE FILTERED COUNT
========================================================= */

function updateFilteredCount(
    count
) {

    setText(
        "filteredCount",
        count
    );


    setText(
        "visibleCount",
        count
    );

}


/* =========================================================
   SEARCH INPUT
========================================================= */

function handleSearchKeyup(
    event
) {

    if (
        event &&
        event.key ===
            "Enter"
    ) {

        applyFilters();

        return;

    }


    applyFilters();

}


/* =========================================================
   VIEW REGISTRATION
========================================================= */

function viewRegistration(
    token
) {

    const registration =
        allRegistrations.find(
            function(item) {

                return (
                    item.token ===
                    token
                );

            }
        );


    if (!registration) {

        alert(
            "Registration not found."
        );

        return;

    }


    showRegistrationModal(
        registration
    );


    logActivity({

        action:
            "VIEW",

        studentName:
            registration.name,

        department:
            registration.department,

        semester:
            registration.semester,

        token:
            registration.token,

        description:
            "Admin viewed registration details."

    });

}


/* =========================================================
   REGISTRATION MODAL
========================================================= */

function showRegistrationModal(
    registration
) {

    let modal =
        document.getElementById(
            "registrationModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "registrationModal";


        modal.className =
            "admin-modal";


        document.body.appendChild(
            modal
        );

    }


    modal.innerHTML = `

        <div
            class="admin-modal-overlay"
            onclick="closeRegistrationModal(event)"
        >

            <div
                class="admin-modal-content"
                onclick="event.stopPropagation()"
            >

                <button
                    type="button"
                    class="modal-close"
                    onclick="closeRegistrationModal()"
                >
                    ×
                </button>


                <h2>
                    🎓 Registration Details
                </h2>


                <div
                    class="registration-details"
                >

                    <div>
                        <strong>
                            Serial Number
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.serialNumber ??
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Token
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.token ||
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Name
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.name ||
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Department
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.department ||
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Department Code
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.departmentCode ||
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Semester
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.semester ||
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Attendance
                        </strong>

                        <span>
                            ${attendanceBadge(
                                registration.attendance
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Reason
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.reason ||
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Submitted At
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.submittedAt ||
                                formatDate(
                                    registration.submittedAtISO
                                ) ||
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Venue
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.venue ||
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Time
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.time ||
                                "-"
                            )}
                        </span>
                    </div>


                    <div>
                        <strong>
                            Date
                        </strong>

                        <span>
                            ${escapeHTML(
                                registration.date ||
                                "-"
                            )}
                        </span>
                    </div>

                </div>


                <div
                    class="modal-actions"
                >

                    <button
                        type="button"
                        onclick="closeRegistrationModal()"
                    >
                        Close
                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deleteRegistration('${escapeJS(
                            registration.token ||
                            ""
                        )}'); closeRegistrationModal();"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>

        </div>

    `;


    modal.style.display =
        "block";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeRegistrationModal(
    event
) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "admin-modal-overlay"
        )
    ) {

        return;

    }


    const modal =
        document.getElementById(
            "registrationModal"
        );


    if (modal) {

        modal.remove();

    }

}


/* =========================================================
   DELETE REGISTRATION
========================================================= */

async function deleteRegistration(
    token
) {

    const registration =
        allRegistrations.find(
            function(item) {

                return (
                    item.token ===
                    token
                );

            }
        );


    if (!registration) {

        alert(
            "Registration not found."
        );

        return;

    }


    const confirmed =
        window.confirm(

            "Are you sure you want to delete this registration?\n\n" +

            "Name: " +
            registration.name +
            "\n" +

            "Token: " +
            registration.token +
            "\n\n" +

            "This action cannot be undone."

        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                API_BASE +
                "/admin/registrations/" +
                encodeURIComponent(
                    token
                ),
                {

                    method:
                        "DELETE",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            adminName:
                                currentAdmin
                                    ? currentAdmin.name
                                    : "Admin",

                            adminId:
                                currentAdmin
                                    ? currentAdmin.id
                                    : "Unknown"

                        })

                }
            );


        const text =
            await response.text();


        let result =
            {};


        if (text.trim()) {

            try {

                result =
                    JSON.parse(
                        text
                    );

            }
            catch (error) {

                throw new Error(
                    "Invalid response from backend."
                );

            }

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to delete registration."
            );

        }


        if (
            result.success ===
            false
        ) {

            throw new Error(
                result.message ||
                "Delete operation failed."
            );

        }


        allRegistrations =
            allRegistrations.filter(
                function(item) {

                    return (
                        item.token !==
                        token
                    );

                }
            );


        /*
           Re-number visible/local records.
        */

        allRegistrations.forEach(
            function(item, index) {

                item.serialNumber =
                    index + 1;

            }
        );


        updateStatistics();

        updateDepartmentFilter();

        renderFilteredTable();


        alert(
            "✅ Registration deleted successfully."
        );


        await loadActivityLogs();

    }
    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "❌ Unable to delete registration.\n\n" +
            error.message
        );

    }

}
/* =========================================================
   LOAD ACTIVITY LOGS
========================================================= */

async function loadActivityLogs() {

    const table =
        document.getElementById(
            "activityTable"
        );


    try {

        const response =
            await fetch(
                API_BASE +
                "/admin/activity",
                {

                    method:
                        "GET",

                    cache:
                        "no-store"

                }
            );


        const text =
            await response.text();


        let result =
            {};


        if (text.trim()) {

            try {

                result =
                    JSON.parse(
                        text
                    );

            }
            catch (error) {

                throw new Error(
                    "Backend returned invalid activity data."
                );

            }

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load activity logs."
            );

        }


        const activities =
            Array.isArray(
                result.activities
            )
                ? result.activities
                : [];


        renderActivityTable(
            activities
        );

    }
    catch (error) {

        console.error(
            "Activity loading error:",
            error
        );


        if (table) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="empty-table"
                    >

                        ❌ Unable to load activity logs.

                        <br><br>

                        ${escapeHTML(
                            error.message
                        )}

                    </td>

                </tr>

            `;

        }

    }

}


/* =========================================================
   RENDER ACTIVITY TABLE
========================================================= */

function renderActivityTable(
    activities
) {

    const tbody =
        document.getElementById(
            "activityTable"
        );


    if (!tbody) {

        return;

    }


    if (
        !activities.length
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-table"
                >

                    No activity found.

                </td>

            </tr>

        `;


        return;

    }


    const sorted =
        [...activities].sort(
            function(a, b) {

                return (
                    new Date(
                        b.time ||
                        0
                    ) -
                    new Date(
                        a.time ||
                        0
                    )
                );

            }
        );


    tbody.innerHTML =
        sorted
            .map(
                function(item, index) {

                    return `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        item.time
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.adminName ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.adminId ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.action ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.studentName ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.token ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.description ||
                                    "-"
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   LOG ACTIVITY
========================================================= */

async function logActivity(
    data = {}
) {

    try {

        await fetch(
            API_BASE +
            "/admin/activity",
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        adminName:
                            currentAdmin
                                ? currentAdmin.name
                                : "Admin",

                        adminId:
                            currentAdmin
                                ? currentAdmin.id
                                : "Unknown",

                        action:
                            data.action ||
                            "UNKNOWN",

                        studentName:
                            data.studentName ||
                            "",

                        department:
                            data.department ||
                            "",

                        semester:
                            data.semester ||
                            "",

                        token:
                            data.token ||
                            "",

                        search:
                            data.search ||
                            "",

                        recordCount:
                            data.recordCount ??
                            null,

                        description:
                            data.description ||
                            ""

                    })

            }
        );

    }
    catch (error) {

        /*
           Activity logging must never
           break the dashboard.
        */

        console.warn(
            "Activity log failed:",
            error
        );

    }

}


/* =========================================================
   CLEAR ACTIVITY
========================================================= */

async function clearActivity() {

    const confirmed =
        window.confirm(
            "Are you sure you want to clear all activity logs?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                API_BASE +
                "/admin/activity",
                {

                    method:
                        "DELETE",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            adminName:
                                currentAdmin
                                    ? currentAdmin.name
                                    : "Admin",

                            adminId:
                                currentAdmin
                                    ? currentAdmin.id
                                    : "Unknown"

                        })

                }
            );


        const text =
            await response.text();


        let result =
            {};


        if (text.trim()) {

            try {

                result =
                    JSON.parse(
                        text
                    );

            }
            catch (error) {

                throw new Error(
                    "Invalid response from backend."
                );

            }

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to clear activity."
            );

        }


        if (
            result.success ===
            false
        ) {

            throw new Error(
                result.message ||
                "Unable to clear activity."
            );

        }


        await loadActivityLogs();


        alert(
            "✅ Activity logs cleared."
        );

    }
    catch (error) {

        console.error(
            "Clear activity error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   REFRESH DASHBOARD
========================================================= */

async function refreshDashboard() {

    const button =
        document.getElementById(
            "refreshButton"
        );


    if (button) {

        button.disabled =
            true;

    }


    try {

        await loadRegistrations();

        await loadActivityLogs();

    }
    finally {

        if (button) {

            button.disabled =
                false;

        }

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function adminLogout() {

    if (!currentAdmin) {

        sessionStorage.removeItem(
            ADMIN_SESSION_KEY
        );


        showLoginPage();

        return;

    }


    await logActivity({

        action:
            "LOGOUT",

        description:
            "Admin logged out."

    });


    sessionStorage.removeItem(
        ADMIN_SESSION_KEY
    );


    currentAdmin =
        null;


    allRegistrations =
        [];


    window.location.href =
        "admin.html";

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportRegistrationsCSV() {

    const records =
        getFilteredRegistrations();


    if (
        !records.length
    ) {

        alert(
            "There are no registrations to export."
        );

        return;

    }


    const headers = [

        "Serial Number",

        "Token",

        "Name",

        "Department",

        "Department Code",

        "Semester",

        "Attendance",

        "Reason",

        "Submitted At",

        "Venue",

        "Time",

        "Date"

    ];


    const rows =
        records.map(
            function(item) {

                return [

                    item.serialNumber,

                    item.token,

                    item.name,

                    item.department,

                    item.departmentCode,

                    item.semester,

                    item.attendance,

                    item.reason,

                    item.submittedAt,

                    item.venue,

                    item.time,

                    item.date

                ];

            }
        );


    const csvRows =
        [
            headers,
            ...rows
        ];


    const csv =
        csvRows
            .map(
                function(row) {

                    return row
                        .map(
                            function(value) {

                                return (
                                    '"' +
                                    String(
                                        value ??
                                        ""
                                    )
                                        .replace(
                                            /"/g,
                                            '""'
                                        ) +
                                    '"'
                                );

                            }
                        )
                        .join(",");

                }
            )
            .join("\r\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "JRSU_Fresher_Registrations.csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    logActivity({

        action:
            "EXPORT",

        recordCount:
            records.length,

        description:
            "Admin exported registration records as CSV."

    });

}


/* =========================================================
   PRINT REGISTRATIONS
========================================================= */

function printRegistrations() {

    if (
        !getFilteredRegistrations().length
    ) {

        alert(
            "There are no registrations to print."
        );

        return;

    }


    logActivity({

        action:
            "PRINT",

        recordCount:
            getFilteredRegistrations().length,

        description:
            "Admin opened registration print view."

    });


    window.print();

}


/* =========================================================
   SET TEXT SAFELY
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            String(
                value ??
                ""
            );

    }

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   JAVASCRIPT STRING ESCAPE
========================================================= */

function escapeJS(
    value
) {

    return String(
        value ??
        ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        )
        .replace(
            /\r/g,
            "\\r"
        )
        .replace(
            /\n/g,
            "\\n"
        );

}


/* =========================================================
   LAST UPDATED
========================================================= */

function updateLastUpdated() {

    const element =
        document.getElementById(
            "lastUpdated"
        );


    if (!element) {

        return;

    }


    element.textContent =
        "Last updated: " +
        new Date().toLocaleTimeString(
            "en-IN",
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"
            }
        );

}


/* =========================================================
   AUTO REFRESH
========================================================= */

let autoRefreshTimer =
    null;


function startAutoRefresh() {

    if (
        autoRefreshTimer
    ) {

        clearInterval(
            autoRefreshTimer
        );

    }


    autoRefreshTimer =
        setInterval(
            async function() {

                if (
                    document.hidden
                ) {

                    return;

                }


                await loadRegistrations();

                await loadActivityLogs();

            },
            60000
        );

}


function stopAutoRefresh() {

    if (
        autoRefreshTimer
    ) {

        clearInterval(
            autoRefreshTimer
        );


        autoRefreshTimer =
            null;

    }

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        /*
           Ctrl + R is intentionally
           left to browser default.
        */

        if (
            event.key ===
            "Escape"
        ) {

            closeRegistrationModal();

        }


        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
                "e"
        ) {

            event.preventDefault();

            exportRegistrationsCSV();

        }

    }
);


/* =========================================================
   CONNECT FILTER EVENTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const searchInput =
            document.getElementById(
                "searchInput"
            );


        const departmentFilter =
            document.getElementById(
                "departmentFilter"
            );


        const attendanceFilter =
            document.getElementById(
                "attendanceFilter"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function() {

                    applyFilters();

                }
            );

        }


        if (departmentFilter) {

            departmentFilter.addEventListener(
                "change",
                function() {

                    applyFilters();

                }
            );

        }


        if (attendanceFilter) {

            attendanceFilter.addEventListener(
                "change",
                function() {

                    applyFilters();

                }
            );

        }


        /*
           Common button IDs.
           Existing HTML onclick handlers
           continue to work as well.
        */

        const refreshButton =
            document.getElementById(
                "refreshButton"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                function() {

                    refreshDashboard();

                }
            );

        }


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                function() {

                    adminLogout();

                }
            );

        }


        const exportButton =
            document.getElementById(
                "exportButton"
            );


        if (exportButton) {

            exportButton.addEventListener(
                "click",
                function() {

                    exportRegistrationsCSV();

                }
            );

        }


        const printButton =
            document.getElementById(
                "printButton"
            );


        if (printButton) {

            printButton.addEventListener(
                "click",
                function() {

                    printRegistrations();

                }
            );

        }


        const clearActivityButton =
            document.getElementById(
                "clearActivityButton"
            );


        if (clearActivityButton) {

            clearActivityButton.addEventListener(
                "click",
                function() {

                    clearActivity();

                }
            );

        }


        startAutoRefresh();

    }
);


/* =========================================================
   VISIBILITY HANDLER
========================================================= */

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.hidden
        ) {

            stopAutoRefresh();

        }
        else {

            startAutoRefresh();

        }

    }
);


/* =========================================================
   GLOBAL ERROR HANDLING
========================================================= */

window.addEventListener(
    "error",
    function(event) {

        console.error(
            "Admin dashboard error:",
            event.error ||
            event.message
        );

    }
);


/* =========================================================
   UNHANDLED PROMISES
========================================================= */

window.addEventListener(
    "unhandledrejection",
    function(event) {

        console.error(
            "Admin dashboard promise error:",
            event.reason
        );

    }
);