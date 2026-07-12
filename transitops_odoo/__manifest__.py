{
    'name': 'TransitOps',
    'version': '1.0.0',
    'category': 'Operations/Fleet',
    'summary': 'Fleet and transit operations management',
    'author': 'TransitOps',
    'depends': ['base', 'mail'],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/menu_views.xml',
        'views/vehicle_views.xml',
        'views/driver_views.xml',
        'views/trip_views.xml',
        'views/maintenance_views.xml',
        'views/dashboard_views.xml',
        'reports/trip_report_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'transitops/static/src/js/dashboard.js',
            'transitops/static/src/xml/dashboard.xml',
        ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
