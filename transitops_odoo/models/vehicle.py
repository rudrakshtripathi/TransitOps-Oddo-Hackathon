from odoo import api, fields, models


class TransitVehicle(models.Model):
    _name = 'transitops.vehicle'
    _description = 'Transit Vehicle'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'name'

    name = fields.Char(string='Registration Number', required=True, tracking=True)
    model = fields.Char(string='Model')
    vehicle_type = fields.Selection([
        ('truck', 'Truck'),
        ('bus', 'Bus'),
        ('van', 'Van'),
        ('car', 'Car'),
    ], string='Vehicle Type', tracking=True)
    max_capacity = fields.Float(string='Max Capacity (kg)')
    odometer = fields.Float(string='Odometer (km)')
    acquisition_cost = fields.Float(string='Acquisition Cost', digits=(16, 2))
    state = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('in_shop', 'In Maintenance'),
        ('retired', 'Retired'),
    ], string='Status', default='available', tracking=True)

    fuel_log_ids = fields.One2many('transitops.fuel.log', 'vehicle_id', string='Fuel Logs')
    maintenance_ids = fields.One2many('transitops.maintenance', 'vehicle_id', string='Maintenance Records')

    total_fuel_cost = fields.Float(
        string='Total Fuel Cost',
        compute='_compute_costs',
        digits=(16, 2),
    )
    total_maintenance_cost = fields.Float(
        string='Total Maintenance Cost',
        compute='_compute_costs',
        digits=(16, 2),
    )
    total_operational_cost = fields.Float(
        string='Total Operational Cost',
        compute='_compute_costs',
        digits=(16, 2),
    )
    fuel_efficiency = fields.Float(
        string='Fuel Efficiency (km/L)',
        compute='_compute_fuel_efficiency',
    )
    roi_percentage = fields.Float(
        string='ROI %',
        compute='_compute_roi',
    )

    _sql_constraints = [
        ('name_unique', 'UNIQUE(name)', 'Registration number must be unique.'),
    ]

    @api.depends('fuel_log_ids.cost', 'maintenance_ids.cost')
    def _compute_costs(self):
        for vehicle in self:
            fuel_cost = sum(vehicle.fuel_log_ids.mapped('cost'))
            maint_cost = sum(vehicle.maintenance_ids.mapped('cost'))
            vehicle.total_fuel_cost = fuel_cost
            vehicle.total_maintenance_cost = maint_cost
            vehicle.total_operational_cost = fuel_cost + maint_cost

    @api.depends('fuel_log_ids.liters')
    def _compute_fuel_efficiency(self):
        for vehicle in self:
            total_liters = sum(vehicle.fuel_log_ids.mapped('liters'))
            trip_distances = sum(
                t.planned_distance for t in self.env['transitops.trip'].search([
                    ('vehicle_id', '=', vehicle.id),
                    ('state', '=', 'completed'),
                ])
            )
            vehicle.fuel_efficiency = (trip_distances / total_liters) if total_liters else 0.0

    @api.depends('total_operational_cost', 'acquisition_cost')
    def _compute_roi(self):
        for vehicle in self:
            # Placeholder ROI: negative operational cost / acquisition cost.
            # Replace numerator with (trip_revenue - operational_cost) when revenue tracking is added.
            base = vehicle.acquisition_cost or 1.0
            vehicle.roi_percentage = (-vehicle.total_operational_cost / base) * 100
