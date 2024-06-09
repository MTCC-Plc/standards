export declare class ClusterService {
    /**
     *
     * @param callback Application startup function
     * @param forks Preferred number of forks in the cluster. The default is 4.
     * However, if there are less CPUs than forks, forks will be reduced to the
     * number of CPUs as there is little benefit in having more forks than CPUs.
     */
    static clusterize(callback: Function, forks?: number): void;
}
