dvid-console [![Picture](https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/jfrc_grey_180x40.png)](http://www.janelia.org)
=============

Web console for [DVID](https://github.com/janelia-flyem/dvid), a distributed, versioned
image-oriented datastore.  The console allows administration of a DVID server without the need to install
additional tools.

This code can be used with DVID in two ways:
* Specify the repo location using the `-webclient` option with the DVID `serve`command.
* Compile the entire repository into gzipped data that is included in dvid executable.  This
allows a single DVID executable to have an embedded console and is the default way that DVID
is built.

Usage
==============

##### Quick Install
*When you want to use the latest release of the console without making any changes.*
* Make sure you have [DVID](https://github.com/janelia-flyem/dvid) installed and configured
* Download the dvid-console-&lt;version&gt;.tar.gz file from the [latest release] (https://github.com/janelia-flyem/dvid-console/releases/latest)
* Unpack it

  ```bash
    tar -zxvf dvid-console-<version>.tar.gz
  ```
* Add `-webclient=/path/to/unpacked/dvid-console` when starting the DVID server eg:

  `dvid -verbose -webclient=/path/to/unpacked/dvid-console serve /path/to/dvid/data`


##### For Developers
*When you want to use the bleeding edge or make your own modifications*
* Clone the repository
* Make sure you have [node and npm](https://nodejs.org/) installed.
* Install [grunt-cli](http://gruntjs.com/getting-started) globally
* Install all the dependencies with npm

  ```bash 
  cd /into/the/repository/clone
  npm install
  ```
* build the console with grunt

  ```bash
  grunt dist
  ```
* Add `-webclient=/path/to/dvid-console/dist` when starting the DVID server  
  
  
