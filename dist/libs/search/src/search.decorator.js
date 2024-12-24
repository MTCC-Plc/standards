"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectSearch = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
function InjectSearch() {
    return (0, common_1.Inject)(constants_1.SEARCH_CLIENT);
}
exports.InjectSearch = InjectSearch;
