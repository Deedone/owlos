﻿using OWLOSAdmin.Ecosystem;
using OWLOSAdmin.Ecosystem.OWLOS;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace OWLOSAdmin.EcosystemExplorer
{
    /// <summary>
    /// Interaction logic for LogControl.xaml
    /// </summary>
    public partial class OWLOSDriverControl : UserControl, IEcosystemChildControl
    {

        private OWLOSDriver driver;

        public EcosystemControl parentControl { get; set; }

        public OWLOSDriverControl(OWLOSDriver driver)
        {
            InitializeComponent();

            parentControl = new EcosystemControl(this);

            this.driver = driver;

            driverName.Text = driver.name;

            if (driver != null)
            {
                driver.OnPropertyCreate += Driver_NewProperty;
               
            }
        }

        private void Driver_NewProperty(object sender, OWLOSPropertyWrapperEventArgs e)
        {
            base.Dispatcher.Invoke(() =>
            {
                // driversControl.Text = driversControl.Text + e.property.name + " " + e.property.value + "\n";
                OWLOSDriverPropertyControl propertyControl = new OWLOSDriverPropertyControl(e.property);
                propertiesHolder.Children.Add(propertyControl);
            });
        }

        public void OnParentGetFocus()
        {
            mainBorder.BorderBrush = (SolidColorBrush)App.Current.Resources["OWLOSInfo"];
        }

        public void OnParentLostFocus()
        {
            mainBorder.BorderBrush = (SolidColorBrush)App.Current.Resources["OWLOSInfoAlpha3"];
        }

        public void OnParentDrag()
        {
            //
        }

        public void OnParentDrop()
        {
            //
        }
    }
}
