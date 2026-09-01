const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

/* =========================================================
   PORT
========================================================= */

const PORT = process.env.PORT || 3000;


/* =========================================================
   PATHS
========================================================= */

const ROOT_DIR = path.join(
    __dirname,
    ".."
);

const FRONTEND_DIR = path.join(
    ROOT_DIR,
    "frontend"
);

const ADMIN_DIR = path.join(
    ROOT_DIR,
    "admin"
);

const DATA_DIR =
    process.env.DATA_DIR
        ? path.resolve(process.env.DATA_DIR)
        : path.join(
            __dirname,
            "data"
        );

const REGISTRATIONS_FILE =
    path.join(
        DATA_DIR,
        "registrations.json"
    );

const ACTIVITY_FILE =
    path.join(
        DATA_DIR,
        "admin-activity.json"
    );


/* =========================================================
   ADMIN CREDENTIALS
========================================================= */

const ADMIN_ID =
    process.env.ADMIN_ID ||
    "JRSU-FRESHER2026";

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD ||
    "JRSU16CODE";


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================================
   DATA FILE SETUP
========================================================= */

function ensureDataFiles() {

    if (
        !fs.existsSync(
            DATA_DIR
        )
    ) {

        fs.mkdirSync(
            DATA_DIR,
            {
                recursive: true
            }
        );

    }


    if (
        !fs.existsSync(
            REGISTRATIONS_FILE
        )
    ) {

        fs.writeFileSync(
            REGISTRATIONS_FILE,
            "[]",
            "utf8"
        );

    }


    if (
        !fs.existsSync(
            ACTIVITY_FILE
        )
    ) {

        fs.writeFileSync(
            ACTIVITY_FILE,
            "[]",
            "utf8"
        );

    }

}

ensureDataFiles();


/* =========================================================
   READ JSON
========================================================= */

function readJSON(
    filePath
) {

    try {

        if (
            !fs.existsSync(
                filePath
            )
        ) {

            return [];

        }


        const content =
            fs.readFileSync(
                filePath,
                "utf8"
            );


        if (
            !content.trim()
        ) {

            return [];

        }


        const data =
            JSON.parse(
                content
            );


        return Array.isArray(
            data
        )
            ? data
            : [];

    }
    catch (error) {

        console.error(
            "JSON READ ERROR:",
            error.message
        );


        return [];

    }

}


/* =========================================================
   WRITE JSON
========================================================= */

function writeJSON(
    filePath,
    data
) {

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf8"
    );

}


/* =========================================================
   ACTIVITY LOGGER
========================================================= */

function addActivity(
    data = {}
) {

    const activities =
        readJSON(
            ACTIVITY_FILE
        );


    const activity = {

        id:
            crypto.randomUUID(),

        time:
            new Date().toISOString(),

        adminName:
            String(
                data.adminName ||
                "Unknown"
            ),

        adminId:
            String(
                data.adminId ||
                "Unknown"
            ),

        action:
            String(
                data.action ||
                "UNKNOWN"
            ),

        studentName:
            String(
                data.studentName ||
                ""
            ),

        department:
            String(
                data.department ||
                ""
            ),

        semester:
            String(
                data.semester ||
                ""
            ),

        token:
            String(
                data.token ||
                ""
            ),

        search:
            String(
                data.search ||
                ""
            ),

        recordCount:
            data.recordCount ??
            null,

        description:
            String(
                data.description ||
                ""
            )

    };


    activities.push(
        activity
    );


    writeJSON(
        ACTIVITY_FILE,
        activities
    );


    return activity;

}


/* =========================================================
   HEALTH
========================================================= */

app.get(
    "/api/health",
    function(req, res) {

        return res.json({

            success: true,

            status: "ok",

            message:
                "JRSU Fresher's Party backend is running.",

            time:
                new Date().toISOString()

        });

    }
);


/* =========================================================
   REGISTER STUDENT
========================================================= */

app.post(
    "/api/register",
    function(req, res) {

        try {

            const body =
                req.body || {};


            const name =
                String(
                    body.name ||
                    ""
                ).trim();


            const department =
                String(
                    body.department ||
                    ""
                ).trim();


            const departmentCode =
                String(
                    body.departmentCode ||
                    "GEN"
                )
                    .trim()
                    .toUpperCase();


            const semester =
                String(
                    body.semester ||
                    ""
                ).trim();


            const attendance =
                String(
                    body.attendance ||
                    ""
                ).trim();


            const reason =
                String(
                    body.reason ||
                    ""
                ).trim();


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (
                !name ||
                !department ||
                !semester
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Name, department and semester are required."

                });

            }


            if (
                attendance !== "Yes" &&
                attendance !== "No"
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Please select Yes or No."

                });

            }


            if (
                attendance === "No" &&
                !reason
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Please provide a reason."

                });

            }


            /* -----------------------------------------
               EXISTING DATA
            ----------------------------------------- */

            const registrations =
                readJSON(
                    REGISTRATIONS_FILE
                );


            /* -----------------------------------------
               GENERATE UNIQUE TOKEN
            ----------------------------------------- */

            let token;


            do {

                const random =
                    crypto
                        .randomBytes(
                            8
                        )
                        .toString(
                            "hex"
                        )
                        .toUpperCase();


                const timestamp =
                    Date.now()
                        .toString(
                            36
                        )
                        .toUpperCase();


                const code =
                    departmentCode
                        .replace(
                            /[^A-Z0-9]/g,
                            ""
                        )
                        .substring(
                            0,
                            6
                        ) ||
                    "GEN";


                token =
                    "JRSU-" +
                    code +
                    "-" +
                    timestamp +
                    random;

            }
            while (
                registrations.some(
                    function(item) {

                        return (
                            item.token ===
                            token
                        );

                    }
                )
            );


            /* -----------------------------------------
               SERIAL NUMBER
            ----------------------------------------- */

            const serialNumber =
                registrations.length + 1;


            /* -----------------------------------------
               TIME
            ----------------------------------------- */

            const now =
                new Date();


            const submittedAt =
                now.toLocaleString(
                    "en-IN",
                    {
                        timeZone:
                            "Asia/Kolkata"
                    }
                );


            /* -----------------------------------------
               REGISTRATION OBJECT
            ----------------------------------------- */

            const registration = {

                serialNumber,

                token,

                name,

                department,

                departmentCode,

                semester,

                attendance,

                reason:
                    attendance === "No"
                        ? reason
                        : "",

                submittedAt,

                submittedAtISO:
                    now.toISOString(),

                venue:
                    "JRSU Auditorium",

                time:
                    "10:00 AM – 5:00 PM",

                date:
                    "To Be Announced"

            };


            /* -----------------------------------------
               SAVE
            ----------------------------------------- */

            registrations.push(
                registration
            );


            writeJSON(
                REGISTRATIONS_FILE,
                registrations
            );


            /* -----------------------------------------
               RESPONSE
            ----------------------------------------- */

            return res.status(
                201
            ).json({

                success: true,

                message:
                    "Registration submitted successfully.",

                registration

            });

        }
        catch (error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Unable to save registration."

            });

        }

    }
);


/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post(
    "/api/admin/login",
    function(req, res) {

        try {

            const body =
                req.body || {};


            const name =
                String(
                    body.name ||
                    ""
                ).trim();


            const id =
                String(
                    body.id ||
                    ""
                ).trim();


            const password =
                String(
                    body.password ||
                    "");


            if (
                !name ||
                !id ||
                !password
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Name, Admin ID and password are required."

                });

            }


            /* -----------------------------------------
               INVALID LOGIN
            ----------------------------------------- */

            if (
                id !== ADMIN_ID ||
                password !== ADMIN_PASSWORD
            ) {

                addActivity({

                    adminName:
                        name,

                    adminId:
                        id,

                    action:
                        "LOGIN_FAILED",

                    description:
                        "Failed admin login attempt."

                });


                return res.status(
                    401
                ).json({

                    success: false,

                    message:
                        "Invalid Admin ID or Password."

                });

            }


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            addActivity({

                adminName:
                    name,

                adminId:
                    id,

                action:
                    "LOGIN",

                description:
                    "Admin successfully logged in."

            });


            return res.json({

                success: true,

                message:
                    "Admin login successful.",

                admin: {

                    name,

                    id

                }

            });

        }
        catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Unable to process admin login."

            });

        }

    }
);
/* =========================================================
   GET ALL REGISTRATIONS
========================================================= */

app.get(
    "/api/admin/registrations",
    function(req, res) {

        try {

            const registrations =
                readJSON(
                    REGISTRATIONS_FILE
                );


            return res.json({

                success: true,

                registrations

            });

        }
        catch (error) {

            console.error(
                "REGISTRATIONS GET ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Unable to load registrations.",

                registrations: []

            });

        }

    }
);


/* =========================================================
   GET SINGLE REGISTRATION
========================================================= */

app.get(
    "/api/admin/registrations/:token",
    function(req, res) {

        try {

            const token =
                String(
                    req.params.token ||
                    ""
                ).trim();


            if (!token) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Registration token is required."

                });

            }


            const registrations =
                readJSON(
                    REGISTRATIONS_FILE
                );


            const registration =
                registrations.find(
                    function(item) {

                        return (
                            item.token ===
                            token
                        );

                    }
                );


            if (!registration) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "Registration not found."

                });

            }


            return res.json({

                success: true,

                registration

            });

        }
        catch (error) {

            console.error(
                "SINGLE REGISTRATION ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Unable to load registration."

            });

        }

    }
);


/* =========================================================
   DELETE REGISTRATION
========================================================= */

app.delete(
    "/api/admin/registrations/:token",
    function(req, res) {

        try {

            const token =
                String(
                    req.params.token ||
                    ""
                ).trim();


            if (!token) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Registration token is required."

                });

            }


            const registrations =
                readJSON(
                    REGISTRATIONS_FILE
                );


            const index =
                registrations.findIndex(
                    function(item) {

                        return (
                            item.token ===
                            token
                        );

                    }
                );


            if (
                index === -1
            ) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "Registration not found."

                });

            }


            const deleted =
                registrations[index];


            registrations.splice(
                index,
                1
            );


            /*
               Re-number serial numbers
               after deletion.
            */

            registrations.forEach(
                function(item, position) {

                    item.serialNumber =
                        position + 1;

                }
            );


            writeJSON(
                REGISTRATIONS_FILE,
                registrations
            );


            const body =
                req.body || {};


            addActivity({

                adminName:
                    body.adminName ||
                    "Admin",

                adminId:
                    body.adminId ||
                    "Unknown",

                action:
                    "DELETE",

                studentName:
                    deleted.name,

                department:
                    deleted.department,

                semester:
                    deleted.semester,

                token:
                    deleted.token,

                description:
                    "Registration deleted by admin."

            });


            return res.json({

                success: true,

                message:
                    "Registration deleted successfully.",

                deleted

            });

        }
        catch (error) {

            console.error(
                "DELETE REGISTRATION ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Unable to delete registration."

            });

        }

    }
);


/* =========================================================
   GET ACTIVITY LOGS
========================================================= */

app.get(
    "/api/admin/activity",
    function(req, res) {

        try {

            const activities =
                readJSON(
                    ACTIVITY_FILE
                );


            return res.json({

                success: true,

                activities

            });

        }
        catch (error) {

            console.error(
                "ACTIVITY GET ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Unable to load activity.",

                activities: []

            });

        }

    }
);


/* =========================================================
   CREATE ACTIVITY LOG
========================================================= */

app.post(
    "/api/admin/activity",
    function(req, res) {

        try {

            const body =
                req.body || {};


            const activity =
                addActivity({

                    adminName:
                        body.adminName,

                    adminId:
                        body.adminId,

                    action:
                        body.action,

                    studentName:
                        body.studentName,

                    department:
                        body.department,

                    semester:
                        body.semester,

                    token:
                        body.token,

                    search:
                        body.search,

                    recordCount:
                        body.recordCount,

                    description:
                        body.description

                });


            return res.status(
                201
            ).json({

                success: true,

                message:
                    "Activity recorded.",

                activity

            });

        }
        catch (error) {

            console.error(
                "ACTIVITY POST ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Unable to record activity."

            });

        }

    }
);


/* =========================================================
   DELETE ALL ACTIVITY
========================================================= */

app.delete(
    "/api/admin/activity",
    function(req, res) {

        try {

            const body =
                req.body || {};


            writeJSON(
                ACTIVITY_FILE,
                []
            );


            addActivity({

                adminName:
                    body.adminName ||
                    "Admin",

                adminId:
                    body.adminId ||
                    "Unknown",

                action:
                    "CLEAR_ACTIVITY",

                description:
                    "Admin cleared activity logs."

            });


            return res.json({

                success: true,

                message:
                    "Activity logs cleared."

            });

        }
        catch (error) {

            console.error(
                "CLEAR ACTIVITY ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Unable to clear activity logs."

            });

        }

    }
);


/* =========================================================
   ADMIN STATS
========================================================= */

app.get(
    "/api/admin/stats",
    function(req, res) {

        try {

            const registrations =
                readJSON(
                    REGISTRATIONS_FILE
                );


            const activities =
                readJSON(
                    ACTIVITY_FILE
                );


            const total =
                registrations.length;


            const yes =
                registrations.filter(
                    function(item) {

                        return (
                            String(
                                item.attendance ||
                                ""
                            ).toLowerCase() ===
                            "yes"
                        );

                    }
                ).length;


            const no =
                registrations.filter(
                    function(item) {

                        return (
                            String(
                                item.attendance ||
                                ""
                            ).toLowerCase() ===
                            "no"
                        );

                    }
                ).length;


            return res.json({

                success: true,

                stats: {

                    total,

                    yes,

                    no,

                    activities:
                        activities.length

                }

            });

        }
        catch (error) {

            console.error(
                "STATS ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Unable to load statistics."

            });

        }

    }
);


/* =========================================================
   ROOT
========================================================= */

app.get(
    "/",
    function(req, res) {

        return res.sendFile(
            path.join(
                FRONTEND_DIR,
                "index.html"
            )
        );

    }
);


/* =========================================================
   FRONTEND STATIC FILES
========================================================= */

app.use(
    "/frontend",
    express.static(
        FRONTEND_DIR
    )
);


/* =========================================================
   ADMIN STATIC FILES
========================================================= */

app.use(
    "/admin",
    express.static(
        ADMIN_DIR
    )
);


/* =========================================================
   FAVICON
========================================================= */

app.get(
    "/favicon.ico",
    function(req, res) {

        return res.status(
            204
        ).end();

    }
);


/* =========================================================
   404 API HANDLER
========================================================= */

app.use(
    "/api",
    function(req, res) {

        return res.status(
            404
        ).json({

            success: false,

            message:
                "API endpoint not found."

        });

    }
);


/* =========================================================
   GENERAL 404
========================================================= */

app.use(
    function(req, res) {

        return res.status(
            404
        ).send(
            "Page not found."
        );

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    function(
        error,
        req,
        res,
        next
    ) {

        console.error(
            "SERVER ERROR:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );

        }


        return res.status(
            500
        ).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);
/* =========================================================
   START SERVER
========================================================= */

const server =
    app.listen(
        PORT,
        "0.0.0.0",
        function() {

            console.log("");
            console.log(
                "=========================================="
            );

            console.log(
                " JRSU FRESHER'S PARTY BACKEND"
            );

            console.log(
                "=========================================="
            );

            console.log(
                "Student Form:"
            );

            console.log(
                `http://localhost:${PORT}/frontend/`
            );

            console.log(
                "Admin Panel:"
            );

            console.log(
                `http://localhost:${PORT}/admin/admin.html`
            );

            console.log(
                "Health:"
            );

            console.log(
                `http://localhost:${PORT}/api/health`
            );

            console.log(
                "=========================================="
            );

            console.log(
                `Server running on port ${PORT}`
            );

            console.log(
                "=========================================="
            );

            console.log("");

        }
    );


/* =========================================================
   SERVER ERROR
========================================================= */

server.on(
    "error",
    function(error) {

        console.error(
            "SERVER START ERROR:"
        );


        if (
            error.code ===
            "EADDRINUSE"
        ) {

            console.error(
                `Port ${PORT} is already in use.`
            );

            console.error(
                "Please stop the other Node.js server and try again."
            );

        }
        else {

            console.error(
                error
            );

        }

    }
);


/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

function shutdown(
    signal
) {

    console.log(
        `\n${signal} received.`
    );


    server.close(
        function() {

            console.log(
                "Server closed successfully."
            );


            process.exit(
                0
            );

        }
    );

}


process.on(
    "SIGINT",
    function() {

        shutdown(
            "SIGINT"
        );

    }
);


process.on(
    "SIGTERM",
    function() {

        shutdown(
            "SIGTERM"
        );

    }
);