﻿/* ----------------------------------------------------------------------------
Ready IoT Solution - OWLOS
Copyright 2019, 2020 by:
- Konstantin Brul (konstabrul@gmail.com)
- Vitalii Glushchenko (cehoweek@gmail.com)
- Denys Melnychuk (meldenvar@gmail.com)
- Denis Kirin (deniskirinacs@gmail.com)

This file is part of Ready IoT Solution - OWLOS

OWLOS is free software : you can redistribute it and/or modify it under the
terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

OWLOS is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with OWLOS. If not, see < https://www.gnu.org/licenses/>.

GitHub: https://github.com/KirinDenis/owlos

(Этот файл — часть Ready IoT Solution - OWLOS.

OWLOS - свободная программа: вы можете перераспространять ее и/или изменять
ее на условиях Стандартной общественной лицензии GNU в том виде, в каком она
была опубликована Фондом свободного программного обеспечения; версии 3
лицензии, любой более поздней версии.

OWLOS распространяется в надежде, что она будет полезной, но БЕЗО ВСЯКИХ
ГАРАНТИЙ; даже без неявной гарантии ТОВАРНОГО ВИДА или ПРИГОДНОСТИ ДЛЯ
ОПРЕДЕЛЕННЫХ ЦЕЛЕЙ.
Подробнее см.в Стандартной общественной лицензии GNU.

Вы должны были получить копию Стандартной общественной лицензии GNU вместе с
этой программой. Если это не так, см. <https://www.gnu.org/licenses/>.)
--------------------------------------------------------------------------------------*/

#include <Arduino.h>
#include "BaseDriver.h"

#define DRIVER_MASK "ActuatorDriver"
#define DRIVER_ID "actuator1"
#define ActuatorLoopInterval 200


class ActuatorDriver : public BaseDriver {
  public:
	  
	  static int getPinsCount()
	  {
		  return 2;
	  }

	  static uint16_t getPinType(int pinIndex)
	  {
		  switch (pinIndex)
		  {
		  case PIN0_INDEX: return DIGITAL_O_MASK | ANALOG_O_MASK;
		  case PIN1_INDEX: return GND_MASK;

		  default:
			  return NO_MASK;
		  }
	  }

    bool init();
	void del();
    bool begin(String _topic);
    bool query();
    String getAllProperties();
    bool publish();
    String onMessage(String _topic, String _payload, int8_t transportMask);

	bool getAnalog();
	bool setAnalog(bool _analog, bool doEvent);

    int getData();
    bool setData(int _data,  bool doEvent);

    bool getPWM();
    bool setPWM(bool _pwm,  bool doEvent);

    bool getInvert();
    bool setInvert(bool _invert,  bool doEvent);

  private:
	  bool analog = false;
      int data = 0;
	  bool pwm = false;	  
	  bool invert = false;
};
