import logging
from datetime import date

from odoo import api, fields, models

_logger = logging.getLogger(__name__)


class TransitDriver(models.Model):
    _name = 'transitops.driver'
    _description = 'Transit Driver'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'name'

    name = fields.Char(string='Full Name', required=True, tracking=True)
    license_number = fields.Char(string='License Number', required=True)
    license_category = fields.Char(string='License Category')
    license_expiry = fields.Date(string='License Expiry Date', required=True, tracking=True)
    contact = fields.Char(string='Contact')
    safety_score = fields.Float(string='Safety Score', default=100.0)
    state = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('off_duty', 'Off Duty'),
        ('suspended', 'Suspended'),
    ], string='Status', default='available', tracking=True)
    user_id = fields.Many2one('res.users', string='Related User', ondelete='set null')

    @api.constrains('license_expiry')
    def _check_license_expiry(self):
        for driver in self:
            if driver.license_expiry and driver.license_expiry < date.today():
                _logger.warning(
                    'Driver %s (id=%s) has an expired license (expiry: %s).',
                    driver.name, driver.id, driver.license_expiry,
                )
                # Not raising — trip dispatching enforces valid license via constraint.

    @property
    def is_license_valid(self):
        return bool(self.license_expiry and self.license_expiry >= date.today())
