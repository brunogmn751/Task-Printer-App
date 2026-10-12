const path = require("node:path");

module.exports = {
  packagerConfig: {
    asar: true,
    name: "Task Printer",
    executableName: "task-printer-app",
    icon: path.resolve(__dirname, "src/assets//image/Psy-icon"),
  },
  makers: [
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          icon: path.resolve(__dirname, "src/assets/image/Psyduck.png"),
        },
      },
    },
    {
      name: "@electron-forge/maker-squirrel",
      config: { name: "task_printer",
        setupIcon: path.resolve(__dirname, "src/assets/image/Psy-icon.ico"),
       },
    },
  ],
};
