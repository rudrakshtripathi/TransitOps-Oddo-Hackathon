from datetime import date

from odoo import api, fields, models
from odoo.exceptions import ValidationError


class TransitTrip(models.Model):
    _name = 'transitops.trip'
    _description = 'Transit Trip'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'name'

    name = fields.Char(string='Trip Name', compute='_compute_name', store=True)
    source = fields.Char(string='Origin', required=True)
    destination = fields.Char(string='Destination', required=True)
    vehicle_id = fields.Many2one(
        'transitops.vehicle',
        string='Vehicle',
        required=True,
        domain=[('state', '=', 'available')],
        tracking=True,
    )
    driver_id = fields.Many2one(
        'transitops.driver',
        string='Driver',
        required=True,
        domain=[('state', '=', 'available')],
        tracking=True,
    )
    cargo_weight = fields.Float(string='Cargo Weight (kg)')
    planned_distance = fields.Float(string='Planned Distance (km)')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('dispatched', 'Dispatched'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True)

    @api.depends('source', 'destination')
    def _compute_name(self):
        for trip in self:
            src = trip.source or '?'
            dst = trip.destination or '?'
            trip.name = f"{src} \u2192 {dst}"

    @api.constrains('cargo_weight', 'vehicle_id')
    def _check_cargo_capacity(self):
        for trip in self:
            if trip.vehicle_id and trip.cargo_weight > trip.vehicle_id.max_capacity:
                raise ValidationError(
                    f"Cargo weight ({trip.cargo_weight} kg) exceeds vehicle max capacity "
                    f"({trip.vehicle_id.max_capacity} kg) for '{trip.vehicle_id.name}'."
                )

    @api.constrains('driver_id')
    def _check_driver_license(self):
        for trip in self:
            if trip.driver_id and trip.driver_id.license_expiry:
                if trip.driver_id.license_expiry < date.today():
                    raise ValidationError(
                        f"Driver '{trip.driver_id.name}' has an expired license "
                        f"(expiry: {trip.driver_id.license_expiry}). Cannot dispatch trip."
                    )

    def action_dispatch(self):
        for trip in self:
            trip.write({'state': 'dispatched'})
            trip.vehicle_id.write({'state': 'on_trip'})
            trip.driver_id.write({'state': 'on_trip'})

    def action_complete(self):
        for trip in self:
            trip.write({'state': 'completed'})
            trip.vehicle_id.write({'state': 'available'})
            trip.driver_id.write({'state': 'available'})

    def action_cancel(self):
        for trip in self:
            trip.write({'state': 'cancelled'})
            if trip.vehicle_id.state == 'on_trip':
                trip.vehicle_id.write({'state': 'available'})
            if trip.driver_id.state == 'on_trip':
                trip.driver_id.write({'state': 'available'})
