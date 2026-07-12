/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

class TransitDashboard extends Component {
    static template = "transitops.Dashboard";
    static props = {};

    setup() {
        this.rpc = useService("rpc");
        this.state = useState({ kpis: null, loading: true, error: null });
        onWillStart(() => this._loadKpis());
    }

    async _loadKpis() {
        try {
            const kpis = await this.rpc("/transitops/dashboard/kpis");
            Object.assign(this.state, { kpis, loading: false });
        } catch (e) {
            Object.assign(this.state, { error: e.message, loading: false });
        }
    }
}

registry.category("actions").add("transitops.dashboard_action", TransitDashboard);
