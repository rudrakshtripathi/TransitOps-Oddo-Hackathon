from odoo import http
from odoo.http import request


class TransitOpsDashboard(http.Controller):

    @http.route('/transitops/dashboard/kpis', type='json', auth='user', methods=['POST'], csrf=False)
    def dashboard_kpis(self):
        Vehicle = request.env['transitops.vehicle']
        Trip = request.env['transitops.trip']

        total_vehicles = Vehicle.search_count([])
        active_vehicles = Vehicle.search_count([('state', '=', 'available')])
        in_maintenance = Vehicle.search_count([('state', '=', 'in_shop')])
        on_trip_count = Vehicle.search_count([('state', '=', 'on_trip')])
        active_trips = Trip.search_count([('state', '=', 'dispatched')])

        utilization = round((on_trip_count / total_vehicles * 100), 1) if total_vehicles else 0.0

        return {
            'active_vehicles': active_vehicles,
            'in_maintenance': in_maintenance,
            'active_trips': active_trips,
            'utilization': utilization,
        }
