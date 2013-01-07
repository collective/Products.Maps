from setuptools import setup, find_packages
from os.path import join

version = '3.0dev'

setup(name='Products.Maps',
      version=version,
      description="A simple, easy to use Plone integration with Google Maps "
                  "by Jarn AS.",
      long_description=open("README.txt").read() + '\n' +
                       open(join('docs','HISTORY.txt')).read(),
      classifiers=[
        "Framework :: Zope2",
        "Framework :: Plone",
        "Framework :: Plone :: 3.3",
        "Framework :: Plone :: 4.0",
        "Framework :: Plone :: 4.1",
        "Framework :: Plone :: 4.2",
        "Framework :: Plone :: 4.3",
        "License :: OSI Approved :: GNU General Public License (GPL)",
        "Programming Language :: Python",
      ],
      keywords='Google Maps Zope Plone',
      author='Florian Schulze',
      author_email='fschulze@jarn.com',
      url='http://plone.org/products/maps',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['Products'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
        'setuptools',
      ],
)
