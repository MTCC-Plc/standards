import { Injectable, Logger } from "@nestjs/common";
import * as _cluster from "cluster";
import * as os from "os";
const cluster = _cluster as unknown as _cluster.Cluster;

@Injectable()
export class ClusterService {
  /**
   *
   * @param callback Application startup function
   * @param forks Preferred number of forks in the cluster. The default is 4.
   * However, if there are less CPUs than forks, forks will be reduced to the
   * number of CPUs as there is little benefit in having more forks than CPUs.
   */
  static clusterize(callback: Function, forks?: number): void {
    const logger = new Logger(ClusterService.name);
    if (!forks) forks = 4;
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
      let primaryForkId: number;
      for (let i = 0; i < forks; i++) {
        const isPrimaryFork = i === 0;
        const worker = cluster.fork({ primaryFork: isPrimaryFork });
        if (isPrimaryFork) {
          primaryForkId = worker.id;
        }
        logger.verbose(
          `${isPrimaryFork ? "PRIMARY " : ""}Worker [ Id: ${worker.id} | PID: ${
            worker.process.pid
          } ] started.`
        );
      }

      cluster.on("exit", (worker, code, signal) => {
        const isPrimaryFork = primaryForkId === worker.id;
        logger.warn(
          `>> ${isPrimaryFork ? "PRIMARY " : ""}Worker [ Id: ${
            worker.id
          } | PID: ${worker.process.pid} ] died. Restarting....`
        );

        let fork;
        if (isPrimaryFork) {
          fork = cluster.fork({ primaryFork: true });
          primaryForkId = fork.id;
        } else {
          fork = cluster.fork();
        }

        logger.verbose(
          `>> ${isPrimaryFork ? "PRIMARY " : ""}Worker [ Id: ${
            fork.id
          } | PID: ${fork.process.pid} ] restarted.`
        );
      });
    } else {
      logger.verbose(`Cluster server started on ${process.pid}`);
      callback();
    }
  }
}
