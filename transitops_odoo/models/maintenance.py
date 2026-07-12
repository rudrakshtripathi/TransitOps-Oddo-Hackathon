from odoo import api, fields, models


class TransitMaintenance(models.Model):
    _name = 'transitops.maintenance'
    _description = 'Vehicle Maintenance Record'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'description'

    vehicle_id = fields.Many2one(
        'transitops.vehicle',
        string='Vehicle',
        required=True,
        ondelete='cascade',
        tracking=True,
    )
    description = fields.Text(string='Description', required=True)
    state = fields.Selection([
        ('open', 'Open'),
        ('closed', 'Closed'),
    ], string='Status', default='open', tracking=True)
    cost = fields.Float(string='Cost', digits=(16, 2))
    date_logged = fields.Date(string='Date Logged', default=fields.Date.today)

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            record.vehicle_id.write({'state': 'in_shop'})
        return records

    def action_close(self):
        for record in self:
            record.write({'state': 'closed'})
            if record.vehicle_id.state != 'retired':
                record.vehicle_id.write({'state': 'available'})
