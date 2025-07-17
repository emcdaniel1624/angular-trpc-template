import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./client/app";
import { config } from "./config";

const bootstrap = () => bootstrapApplication(App, config);

export default bootstrap;
