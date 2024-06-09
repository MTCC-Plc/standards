"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ClusterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterService = void 0;
const common_1 = require("@nestjs/common");
const _cluster = require("cluster");
const os = require("os");
const cluster = _cluster;
let ClusterService = ClusterService_1 = class ClusterService {
    /**
     *
     * @param callback Application startup function
     * @param forks Preferred number of forks in the cluster. The default is 4.
     * However, if there are less CPUs than forks, forks will be reduced to the
     * number of CPUs as there is little benefit in having more forks than CPUs.
     */
    static clusterize(callback, forks) {
        const logger = new common_1.Logger(ClusterService_1.name);
        if (!forks)
            forks = 4;
        const numCPUs = os.cpus().length;
        if (forks > numCPUs) {
            forks = numCPUs;
        }
        if (cluster.isPrimary) {
            logger.verbose(`Master server started on ${process.pid}`);
            // A PRIMARY FORK is maintained to avoid running duplicated scheduled jobs on
            // every fork unnecessarily. In the current solution, CRONS are to be registered/run
            // only on the PRIMARY FORK. While this mostly works for the current use cases, it can miss
            // certain CRONS if the PRIMARY FORK happens to be down at the time of tick. A more comprehensive solution
            // would be to run the CRONS on all FORKS, and use REDIS LOCKS, with something like "Warlock" to
            // prevent multiple runs for the same CRON functions
            let primaryForkId;
            for (let i = 0; i < forks; i++) {
                const isPrimaryFork = i === 0;
                const worker = cluster.fork({ primaryFork: isPrimaryFork });
                if (isPrimaryFork) {
                    primaryForkId = worker.id;
                }
                logger.verbose(`${isPrimaryFork ? "PRIMARY " : ""}Worker [ Id: ${worker.id} | PID: ${worker.process.pid} ] started.`);
            }
            cluster.on("exit", (worker, code, signal) => {
                const isPrimaryFork = primaryForkId === worker.id;
                logger.warn(`>> ${isPrimaryFork ? "PRIMARY " : ""}Worker [ Id: ${worker.id} | PID: ${worker.process.pid} ] died. Restarting....`);
                let fork;
                if (isPrimaryFork) {
                    fork = cluster.fork({ primaryFork: true });
                    primaryForkId = fork.id;
                }
                else {
                    fork = cluster.fork();
                }
                logger.verbose(`>> ${isPrimaryFork ? "PRIMARY " : ""}Worker [ Id: ${fork.id} | PID: ${fork.process.pid} ] restarted.`);
            });
        }
        else {
            logger.verbose(`Cluster server started on ${process.pid}`);
            callback();
        }
    }
};
ClusterService = ClusterService_1 = __decorate([
    (0, common_1.Injectable)()
], ClusterService);
exports.ClusterService = ClusterService;
