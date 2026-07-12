from odoo import fields, models


class TransitFuelLog(models.Model):
    _name = 'transitops.fuel.log'
    _description = 'Vehicle Fuel Log'
    _rec_name = 'vehicle_id'

    vehicle_id = fields.Many2one(
        'transitops.vehicle',
        string='Vehicle',
        required=True,
        ondelete='cascade',
    )
    liters = fields.Float(string='Liters Fueled')
    cost = fields.Float(string='Cost', digits=(16, 2))
    date = fields.Date(string='Date', default=fields.Date.today)
    trip_id = fields.Many2one('transitops.trip', string='Related Trip', ondelete='set null')
