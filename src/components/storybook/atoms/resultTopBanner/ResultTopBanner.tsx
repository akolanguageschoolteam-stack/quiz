'use client'
// Inline SVG so its fills resolve the theme CSS vars (--primary / --primary-100).
// Banner recolors automatically when the primary theme color changes.
import { ResultTopBannerProps } from './ResultTopBanner.type';

const SVG_MARKUP = `
<svg width="100%" height="100%" viewBox="0 0 1920 549" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0H1920V429C1920 429 1345.51 549 960 549C574.487 549 0 429 0 429V0Z" fill="var(--primary)"/>
<path d="M0 0H1920V429C1920 429 1345.51 549 960 549C574.487 549 0 429 0 429V0Z" fill="url(#paint0_linear_12237_12175)" fill-opacity="0.24"/>
<mask id="mask0_12237_12175" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="549">
<path d="M0 0H1920V429C1920 429 1345.51 549 960 549C574.487 549 0 429 0 429V0Z" fill="var(--primary)"/>
<path d="M0 0H1920V429C1920 429 1345.51 549 960 549C574.487 549 0 429 0 429V0Z" fill="url(#paint1_linear_12237_12175)" fill-opacity="0.24"/>
</mask>
<g mask="url(#mask0_12237_12175)">
<g opacity="0.1">
<path d="M1920 735.689L1239.69 454.773L1920 790.785V735.689Z" fill="var(--primary-100)"/>
<path d="M0 245.937V283.366L554.879 303.257L0 245.937Z" fill="var(--primary-100)"/>
<path d="M1333.92 942L1168.9 677.975L1310.14 942H1333.92Z" fill="var(--primary-100)"/>
<path d="M1475.17 -351L1107.6 153.913L1529.96 -351H1475.17Z" fill="var(--primary-100)"/>
<path d="M1920 527.514L1371.87 423.016L1920 566.193V527.514Z" fill="var(--primary-100)"/>
<path d="M1920 691.024L1269.61 453.537L1920 741.843V691.024Z" fill="var(--primary-100)"/>
<path d="M1920 490.86L1315.08 397.473L1920 532.926V490.86Z" fill="var(--primary-100)"/>
<path d="M218.43 -351L677.716 56.1627L276.371 -351H218.43Z" fill="var(--primary-100)"/>
<path d="M1920 -259.744L1340.75 111.024L1920 -207.054V-259.744Z" fill="var(--primary-100)"/>
<path d="M1108.74 942L1059.59 748.625L1095.06 942H1108.74Z" fill="var(--primary-100)"/>
<path d="M0 -160.818V-100.498L730.987 218.643L0 -160.818Z" fill="var(--primary-100)"/>
<path d="M1920 941.091L1161.48 462.898L1818.97 942H1920V941.091Z" fill="var(--primary-100)"/>
<path d="M807.502 -351L911.242 64.4478L836.831 -351H807.502Z" fill="var(--primary-100)"/>
<path d="M329.427 942L842.774 445.666L255.022 942H329.427Z" fill="var(--primary-100)"/>
<path d="M1718.64 942L1167.12 501.751L1648.37 942H1718.64Z" fill="var(--primary-100)"/>
<path d="M341.401 -351L741.098 73.5345L392.172 -351H341.401Z" fill="var(--primary-100)"/>
<path d="M907.785 942L921.736 758.012L895.214 942H907.785Z" fill="var(--primary-100)"/>
<path d="M1920 75.6192L1262.1 260.182L1920 122.443V75.6192Z" fill="var(--primary-100)"/>
<path d="M1920 216.198L1334.72 295.099L1920 255.885V216.198Z" fill="var(--primary-100)"/>
<path d="M1920 417.664L1211.77 360.036L1920 465.838V417.664Z" fill="var(--primary-100)"/>
<path d="M1920 -174.348L1271.79 179.463L1920 -119.747V-174.348Z" fill="var(--primary-100)"/>
<path d="M629.853 942L901.366 445.566L584.657 942H629.853Z" fill="var(--primary-100)"/>
<path d="M1025.66 942L984.126 549.236L999.001 942H1025.66Z" fill="var(--primary-100)"/>
<path d="M1347.62 -351L1160 0.606201L1379.25 -351H1347.62Z" fill="var(--primary-100)"/>
<path d="M1609.19 -351L1255.6 37.3076L1660.19 -351H1609.19Z" fill="var(--primary-100)"/>
<path d="M1161.21 942L1082.64 710.146L1144.15 942H1161.21Z" fill="var(--primary-100)"/>
<path d="M1424.29 942L1220.61 679.919L1397.35 942H1424.29Z" fill="var(--primary-100)"/>
<path d="M1714.62 942L1276.3 593.821L1658.73 942H1714.62Z" fill="var(--primary-100)"/>
<path d="M1920 344.115L1180.38 340.226L1920 393.838V344.115Z" fill="var(--primary-100)"/>
<path d="M1281.98 942L1148.57 694.612L1261.17 942H1281.98Z" fill="var(--primary-100)"/>
<path d="M1016.6 -351L1001.88 -61.3846L1036.29 -351H1016.6Z" fill="var(--primary-100)"/>
<path d="M514.112 942L777.483 578.093L474.792 942H514.112Z" fill="var(--primary-100)"/>
<path d="M1920 124.093L1380.77 250.126L1920 161.723V124.093Z" fill="var(--primary-100)"/>
<path d="M1920 420.243L1293.23 369.364L1920 462.878V420.243Z" fill="var(--primary-100)"/>
<path d="M855.693 942L888.125 741.328L841.622 942H855.693Z" fill="var(--primary-100)"/>
<path d="M0 -315.642L627.829 93.3585L36.74 -351H0V-315.642Z" fill="var(--primary-100)"/>
<path d="M588.141 942L838.292 530.742L548.5 942H588.141Z" fill="var(--primary-100)"/>
<path d="M0 575.401V627.489L720.024 401.074L0 575.401Z" fill="var(--primary-100)"/>
<path d="M0 -178.016V-113.647L770.407 234.364L0 -178.016Z" fill="var(--primary-100)"/>
<path d="M693.369 -351L864.445 57.6928L724.916 -351H693.369Z" fill="var(--primary-100)"/>
<path d="M0 64.0936V111.88L669.213 256.654L0 64.0936Z" fill="var(--primary-100)"/>
<path d="M1920 120.278L1300.12 265.807L1920 163.554V120.278Z" fill="var(--primary-100)"/>
<path d="M0 -280.357V-216.929L694.166 167.69L0 -280.357Z" fill="var(--primary-100)"/>
<path d="M0 648.008V705.776L763.304 405.009L0 648.008Z" fill="var(--primary-100)"/>
<path d="M0 792.829V830.934L13.0865 856.364L834.553 400.566L0 792.829Z" fill="var(--primary-100)"/>
<path d="M0 708.141V765.375L3.20294 772.925L836.952 387.544L0 708.141Z" fill="var(--primary-100)"/>
<path d="M1920 -129.162L1358.43 152.543L1920 -83.4201V-129.162Z" fill="var(--primary-100)"/>
<path d="M1048.24 -351L1005.7 61.5146L1076.62 -351H1048.24Z" fill="var(--primary-100)"/>
<path d="M1216.18 942L1013.01 450.711L1178.37 942H1216.18Z" fill="var(--primary-100)"/>
<path d="M1920 911.8L1334.03 565.151L1883.19 942H1920V911.8Z" fill="var(--primary-100)"/>
<path d="M0 156.358V199.146L621.571 276.785L0 156.358Z" fill="var(--primary-100)"/>
<path d="M0 41.1828V88.7216L657.976 246.445L0 41.1828Z" fill="var(--primary-100)"/>
<path d="M394.517 -351L723.991 29.5437L436.94 -351H394.517Z" fill="var(--primary-100)"/>
<path d="M1374.38 942L1194.76 682.952L1349.66 942H1374.38Z" fill="var(--primary-100)"/>
<path d="M559.703 -351L782.227 7.742L591.887 -351H559.703Z" fill="var(--primary-100)"/>
<path d="M1920 355.8L1249.31 345.671L1920 400.927V355.8Z" fill="var(--primary-100)"/>
<path d="M1403.71 942L1176.4 634.231L1373.14 942H1403.71Z" fill="var(--primary-100)"/>
<path d="M1599.57 -351L1253.62 34.8221L1649.51 -351H1599.57Z" fill="var(--primary-100)"/>
<path d="M1828.32 942L1305.63 581.574L1759.71 942H1828.32Z" fill="var(--primary-100)"/>
<path d="M0 48.7663V104.984L782.877 283.146L0 48.7663Z" fill="var(--primary-100)"/>
<path d="M711.072 -351L861.094 29.7909L740.019 -351H711.072Z" fill="var(--primary-100)"/>
<path d="M219.093 942L630.972 596.414L157.842 942H219.093Z" fill="var(--primary-100)"/>
<path d="M1920 35.1294L1157.08 278.709L1920 90.4587V35.1294Z" fill="var(--primary-100)"/>
<path d="M1322.86 942L1176.81 701.908L1301.53 942H1322.86Z" fill="var(--primary-100)"/>
<path d="M0 923.499V942H66.6921L679.612 517.886L0 923.499Z" fill="var(--primary-100)"/>
<path d="M1920 823.243L1249.05 485.307L1920 881.833V823.243Z" fill="var(--primary-100)"/>
<path d="M0 -83.4134V-38.8546L569.493 170.155L0 -83.4134Z" fill="var(--primary-100)"/>
<path d="M581.668 942L733.392 691.825L557.599 942H581.668Z" fill="var(--primary-100)"/>
<path d="M1822.82 -351L1245.74 120.606L1909.26 -351H1822.82Z" fill="var(--primary-100)"/>
<path d="M0 650.788V702.061L677.649 435.357L0 650.788Z" fill="var(--primary-100)"/>
<path d="M1920 724.672L1361.64 503.327L1920 769.324V724.672Z" fill="var(--primary-100)"/>
<path d="M1134.05 942L1054.95 670.612L1114.54 942H1134.05Z" fill="var(--primary-100)"/>
<path d="M915.323 942L935.794 648.015L895.261 942H915.323Z" fill="var(--primary-100)"/>
<path d="M1309.04 -351L1159.38 -36.4827L1335.95 -351H1309.04Z" fill="var(--primary-100)"/>
<path d="M1920 348.411L1397.08 347.295L1920 383.555V348.411Z" fill="var(--primary-100)"/>
<path d="M1920 -215.079L1317.69 141.078L1920 -162.469V-215.079Z" fill="var(--primary-100)"/>
<path d="M767.11 942L844.61 690.589L748.12 942H767.11Z" fill="var(--primary-100)"/>
<path d="M804.882 942L890.162 603.804L780.156 942H804.882Z" fill="var(--primary-100)"/>
<path d="M239.108 942L646.658 590.935L178.882 942H239.108Z" fill="var(--primary-100)"/>
<path d="M0 640.705V689.514L649.801 441.53L0 640.705Z" fill="var(--primary-100)"/>
<path d="M1409.59 -351L1207.83 -25.9727L1441.29 -351H1409.59Z" fill="var(--primary-100)"/>
<path d="M0 251.302V289.447L565.942 306.404L0 251.302Z" fill="var(--primary-100)"/>
<path d="M637.981 942L807.569 616.826L609.047 942H637.981Z" fill="var(--primary-100)"/>
<path d="M1582.8 -351L1263.37 15.6997L1628.99 -351H1582.8Z" fill="var(--primary-100)"/>
<path d="M500.623 -351L733.258 -23.7545L532.338 -351H500.623Z" fill="var(--primary-100)"/>
<path d="M388.875 -351L694.334 -2.72787L428.108 -351H388.875Z" fill="var(--primary-100)"/>
<path d="M843.619 -351L946.542 190.4L881.049 -351H843.619Z" fill="var(--primary-100)"/>
<path d="M0 410.862V456.39L670.767 363.223L0 410.862Z" fill="var(--primary-100)"/>
<path d="M0 -339.568V-278.873L627.595 106.521L0 -339.568Z" fill="var(--primary-100)"/>
<path d="M1920 477.671L1373.74 402.036L1920 515.441V477.671Z" fill="var(--primary-100)"/>
<path d="M1920 737.901L1357.08 506.902L1920 783.402V737.901Z" fill="var(--primary-100)"/>
<path d="M613.041 -351L775.272 -53.1664L638.189 -351H613.041Z" fill="var(--primary-100)"/>
<path d="M831.511 942L927.74 494.735L799.421 942H831.511Z" fill="var(--primary-100)"/>
<path d="M888.306 -351L952.82 160.882L923.156 -351H888.306Z" fill="var(--primary-100)"/>
<path d="M1667.59 -351L1278.87 40.1071L1723.74 -351H1667.59Z" fill="var(--primary-100)"/>
<path d="M1920 12.9736L1367.71 206.797L1920 53.7173V12.9736Z" fill="var(--primary-100)"/>
<path d="M1115.23 942L1042.74 663.035L1095.45 942H1115.23Z" fill="var(--primary-100)"/>
<path d="M522.206 -351L761.857 3.19193L555.529 -351H522.206Z" fill="var(--primary-100)"/>
<path d="M1242.77 -351L1134.72 -65.7209L1265.37 -351H1242.77Z" fill="var(--primary-100)"/>
<path d="M1920 449.087L1355.22 387.41L1920 487.78V449.087Z" fill="var(--primary-100)"/>
<path d="M600.51 942L787.48 620.514L570.297 942H600.51Z" fill="var(--primary-100)"/>
<path d="M610.086 942L760.952 673.692L585.313 942H610.086Z" fill="var(--primary-100)"/>
<path d="M1920 -37.064L1264.33 225.104L1920 12.7398V-37.064Z" fill="var(--primary-100)"/>
<path d="M377.839 942L803.703 494.087L316.434 942H377.839Z" fill="var(--primary-100)"/>
<path d="M1222.03 942L1076.27 605.561L1195.81 942H1222.03Z" fill="var(--primary-100)"/>
<path d="M1828.35 942L1134.4 456.53L1737.59 942H1828.35Z" fill="var(--primary-100)"/>
<path d="M753.2 942L831.129 705.736L735.101 942H753.2Z" fill="var(--primary-100)"/>
<path d="M1131.78 942L1060.89 696.943L1114.17 942H1131.78Z" fill="var(--primary-100)"/>
<path d="M57.3379 -351L793.779 193.474L152.434 -351H57.3379Z" fill="var(--primary-100)"/>
<path d="M1149.67 -351L1084.74 -84.0682L1169.09 -351H1149.67Z" fill="var(--primary-100)"/>
<path d="M1339.68 942L1081.09 526.973L1302.36 942H1339.68Z" fill="var(--primary-100)"/>
<path d="M1920 304.112L1089.13 332.001L1920 359.889V304.112Z" fill="var(--primary-100)"/>
</g>
</g>
<defs>
<linearGradient id="paint0_linear_12237_12175" x1="960" y1="0" x2="960" y2="549" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint1_linear_12237_12175" x1="960" y1="0" x2="960" y2="549" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
`;

const SVG_MARKUP_LEADERBOARD = `
<svg width="100%" height=100%" viewBox="0 0 1920 989" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0H1920V869C1920 869 1345.51 989 960 989C574.487 989 0 869 0 869L0 0Z" fill="var(--primary)"/>
<path d="M0 0H1920V869C1920 869 1345.51 989 960 989C574.487 989 0 869 0 869L0 0Z" fill="url(#paint0_linear_12671_22730)" fill-opacity="0.24"/>
<mask id="mask0_12671_22730" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="989">
<path d="M0 0H1920V869C1920 869 1345.51 989 960 989C574.487 989 0 869 0 869L0 0Z" fill="var(--primary)"/>
<path d="M0 0H1920V869C1920 869 1345.51 989 960 989C574.487 989 0 869 0 869L0 0Z" fill="url(#paint1_linear_12671_22730)" fill-opacity="0.24"/>
</mask>
<g mask="url(#mask0_12671_22730)">
<g opacity="0.1">
<path d="M1920 845.689L1239.69 564.773L1920 900.785V845.689Z" fill="var(--primary-100)"/>
<path d="M0 355.937V393.366L554.879 413.257L0 355.937Z" fill="var(--primary-100)"/>
<path d="M1333.92 1052L1168.9 787.975L1310.14 1052H1333.92Z" fill="var(--primary-100)"/>
<path d="M1475.17 -241L1107.6 263.913L1529.96 -241H1475.17Z" fill="var(--primary-100)"/>
<path d="M1920 637.514L1371.87 533.016L1920 676.193V637.514Z" fill="var(--primary-100)"/>
<path d="M1920 801.024L1269.61 563.537L1920 851.843V801.024Z" fill="var(--primary-100)"/>
<path d="M1920 600.86L1315.08 507.473L1920 642.926V600.86Z" fill="var(--primary-100)"/>
<path d="M218.43 -241L677.716 166.163L276.371 -241H218.43Z" fill="var(--primary-100)"/>
<path d="M1920 -149.744L1340.75 221.024L1920 -97.0542V-149.744Z" fill="var(--primary-100)"/>
<path d="M1108.74 1052L1059.59 858.625L1095.06 1052H1108.74Z" fill="var(--primary-100)"/>
<path d="M0 -50.8183V9.50203L730.987 328.643L0 -50.8183Z" fill="var(--primary-100)"/>
<path d="M1920 1051.09L1161.48 572.898L1818.97 1052H1920V1051.09Z" fill="var(--primary-100)"/>
<path d="M807.502 -241L911.242 174.448L836.831 -241H807.502Z" fill="var(--primary-100)"/>
<path d="M329.427 1052L842.774 555.666L255.022 1052H329.427Z" fill="var(--primary-100)"/>
<path d="M1718.64 1052L1167.12 611.751L1648.37 1052H1718.64Z" fill="var(--primary-100)"/>
<path d="M341.401 -241L741.098 183.535L392.172 -241H341.401Z" fill="var(--primary-100)"/>
<path d="M907.785 1052L921.736 868.012L895.214 1052H907.785Z" fill="var(--primary-100)"/>
<path d="M1920 185.619L1262.1 370.182L1920 232.443V185.619Z" fill="var(--primary-100)"/>
<path d="M1920 326.198L1334.72 405.099L1920 365.885V326.198Z" fill="var(--primary-100)"/>
<path d="M1920 527.664L1211.77 470.036L1920 575.838V527.664Z" fill="var(--primary-100)"/>
<path d="M1920 -64.3483L1271.79 289.463L1920 -9.7473V-64.3483Z" fill="var(--primary-100)"/>
<path d="M629.853 1052L901.366 555.566L584.657 1052H629.853Z" fill="var(--primary-100)"/>
<path d="M1025.66 1052L984.126 659.236L999.001 1052H1025.66Z" fill="var(--primary-100)"/>
<path d="M1347.62 -241L1160 110.606L1379.25 -241H1347.62Z" fill="var(--primary-100)"/>
<path d="M1609.19 -241L1255.6 147.308L1660.19 -241H1609.19Z" fill="var(--primary-100)"/>
<path d="M1161.21 1052L1082.64 820.146L1144.15 1052H1161.21Z" fill="var(--primary-100)"/>
<path d="M1424.29 1052L1220.61 789.919L1397.35 1052H1424.29Z" fill="var(--primary-100)"/>
<path d="M1714.62 1052L1276.3 703.821L1658.73 1052H1714.62Z" fill="var(--primary-100)"/>
<path d="M1920 454.115L1180.38 450.226L1920 503.838V454.115Z" fill="var(--primary-100)"/>
<path d="M1281.98 1052L1148.57 804.612L1261.17 1052H1281.98Z" fill="var(--primary-100)"/>
<path d="M1016.6 -241L1001.88 48.6154L1036.29 -241H1016.6Z" fill="var(--primary-100)"/>
<path d="M514.112 1052L777.483 688.093L474.792 1052H514.112Z" fill="var(--primary-100)"/>
<path d="M1920 234.093L1380.77 360.126L1920 271.723V234.093Z" fill="var(--primary-100)"/>
<path d="M1920 530.243L1293.23 479.364L1920 572.878V530.243Z" fill="var(--primary-100)"/>
<path d="M855.693 1052L888.125 851.328L841.622 1052H855.693Z" fill="var(--primary-100)"/>
<path d="M0 -205.642L627.829 203.358L36.74 -241H0V-205.642Z" fill="var(--primary-100)"/>
<path d="M588.141 1052L838.292 640.742L548.5 1052H588.141Z" fill="var(--primary-100)"/>
<path d="M0 685.401V737.489L720.024 511.074L0 685.401Z" fill="var(--primary-100)"/>
<path d="M0 -68.0165V-3.64713L770.407 344.364L0 -68.0165Z" fill="var(--primary-100)"/>
<path d="M693.369 -241L864.445 167.693L724.916 -241H693.369Z" fill="var(--primary-100)"/>
<path d="M0 174.094V221.88L669.213 366.654L0 174.094Z" fill="var(--primary-100)"/>
<path d="M1920 230.278L1300.12 375.807L1920 273.554V230.278Z" fill="var(--primary-100)"/>
<path d="M0 -170.357V-106.929L694.166 277.69L0 -170.357Z" fill="var(--primary-100)"/>
<path d="M0 758.008V815.776L763.304 515.009L0 758.008Z" fill="var(--primary-100)"/>
<path d="M0 902.829V940.934L13.0865 966.364L834.553 510.566L0 902.829Z" fill="var(--primary-100)"/>
<path d="M0 818.141V875.375L3.20294 882.925L836.952 497.544L0 818.141Z" fill="var(--primary-100)"/>
<path d="M1920 -19.1615L1358.43 262.543L1920 26.5799V-19.1615Z" fill="var(--primary-100)"/>
<path d="M1048.24 -241L1005.7 171.515L1076.62 -241H1048.24Z" fill="var(--primary-100)"/>
<path d="M1216.18 1052L1013.01 560.711L1178.37 1052H1216.18Z" fill="var(--primary-100)"/>
<path d="M1920 1021.8L1334.03 675.151L1883.19 1052H1920V1021.8Z" fill="var(--primary-100)"/>
<path d="M0 266.358V309.146L621.571 386.785L0 266.358Z" fill="var(--primary-100)"/>
<path d="M0 151.183V198.722L657.976 356.445L0 151.183Z" fill="var(--primary-100)"/>
<path d="M394.517 -241L723.991 139.544L436.94 -241H394.517Z" fill="var(--primary-100)"/>
<path d="M1374.38 1052L1194.76 792.952L1349.66 1052H1374.38Z" fill="var(--primary-100)"/>
<path d="M559.703 -241L782.227 117.742L591.887 -241H559.703Z" fill="var(--primary-100)"/>
<path d="M1920 465.8L1249.31 455.671L1920 510.927V465.8Z" fill="var(--primary-100)"/>
<path d="M1403.71 1052L1176.4 744.231L1373.14 1052H1403.71Z" fill="var(--primary-100)"/>
<path d="M1599.57 -241L1253.62 144.822L1649.51 -241H1599.57Z" fill="var(--primary-100)"/>
<path d="M1828.32 1052L1305.63 691.574L1759.71 1052H1828.32Z" fill="var(--primary-100)"/>
<path d="M0 158.766V214.984L782.877 393.146L0 158.766Z" fill="var(--primary-100)"/>
<path d="M711.072 -241L861.094 139.791L740.019 -241H711.072Z" fill="var(--primary-100)"/>
<path d="M219.093 1052L630.972 706.414L157.842 1052H219.093Z" fill="var(--primary-100)"/>
<path d="M1920 145.129L1157.08 388.709L1920 200.459V145.129Z" fill="var(--primary-100)"/>
<path d="M1322.86 1052L1176.81 811.908L1301.53 1052H1322.86Z" fill="var(--primary-100)"/>
<path d="M0 1033.5V1052H66.6921L679.612 627.886L0 1033.5Z" fill="var(--primary-100)"/>
<path d="M1920 933.243L1249.05 595.307L1920 991.833V933.243Z" fill="var(--primary-100)"/>
<path d="M0 26.5866V71.1454L569.493 280.155L0 26.5866Z" fill="var(--primary-100)"/>
<path d="M581.668 1052L733.392 801.825L557.599 1052H581.668Z" fill="var(--primary-100)"/>
<path d="M1822.82 -241L1245.74 230.606L1909.26 -241H1822.82Z" fill="var(--primary-100)"/>
<path d="M0 760.788V812.061L677.649 545.357L0 760.788Z" fill="var(--primary-100)"/>
<path d="M1920 834.672L1361.64 613.327L1920 879.324V834.672Z" fill="var(--primary-100)"/>
<path d="M1134.05 1052L1054.95 780.612L1114.54 1052H1134.05Z" fill="var(--primary-100)"/>
<path d="M915.323 1052L935.794 758.015L895.261 1052H915.323Z" fill="var(--primary-100)"/>
<path d="M1309.04 -241L1159.38 73.5173L1335.95 -241H1309.04Z" fill="var(--primary-100)"/>
<path d="M1920 458.411L1397.08 457.295L1920 493.555V458.411Z" fill="var(--primary-100)"/>
<path d="M1920 -105.079L1317.69 251.078L1920 -52.4687V-105.079Z" fill="var(--primary-100)"/>
<path d="M767.11 1052L844.61 800.589L748.12 1052H767.11Z" fill="var(--primary-100)"/>
<path d="M804.882 1052L890.162 713.804L780.156 1052H804.882Z" fill="var(--primary-100)"/>
<path d="M239.108 1052L646.658 700.935L178.882 1052H239.108Z" fill="var(--primary-100)"/>
<path d="M0 750.705V799.514L649.801 551.53L0 750.705Z" fill="var(--primary-100)"/>
<path d="M1409.59 -241L1207.83 84.0273L1441.29 -241H1409.59Z" fill="var(--primary-100)"/>
<path d="M0 361.302V399.447L565.942 416.404L0 361.302Z" fill="var(--primary-100)"/>
<path d="M637.981 1052L807.569 726.826L609.047 1052H637.981Z" fill="var(--primary-100)"/>
<path d="M1582.8 -241L1263.37 125.7L1628.99 -241H1582.8Z" fill="var(--primary-100)"/>
<path d="M500.623 -241L733.258 86.2455L532.338 -241H500.623Z" fill="var(--primary-100)"/>
<path d="M388.875 -241L694.334 107.272L428.108 -241H388.875Z" fill="var(--primary-100)"/>
<path d="M843.619 -241L946.542 300.4L881.049 -241H843.619Z" fill="var(--primary-100)"/>
<path d="M0 520.862V566.39L670.767 473.223L0 520.862Z" fill="var(--primary-100)"/>
<path d="M0 -229.568V-168.873L627.595 216.521L0 -229.568Z" fill="var(--primary-100)"/>
<path d="M1920 587.671L1373.74 512.036L1920 625.441V587.671Z" fill="var(--primary-100)"/>
<path d="M1920 847.901L1357.08 616.902L1920 893.402V847.901Z" fill="var(--primary-100)"/>
<path d="M613.041 -241L775.272 56.8336L638.189 -241H613.041Z" fill="var(--primary-100)"/>
<path d="M831.511 1052L927.74 604.735L799.421 1052H831.511Z" fill="var(--primary-100)"/>
<path d="M888.306 -241L952.82 270.882L923.156 -241H888.306Z" fill="var(--primary-100)"/>
<path d="M1667.59 -241L1278.87 150.107L1723.74 -241H1667.59Z" fill="var(--primary-100)"/>
<path d="M1920 122.974L1367.71 316.797L1920 163.717V122.974Z" fill="var(--primary-100)"/>
<path d="M1115.23 1052L1042.74 773.035L1095.45 1052H1115.23Z" fill="var(--primary-100)"/>
<path d="M522.206 -241L761.857 113.192L555.529 -241H522.206Z" fill="var(--primary-100)"/>
<path d="M1242.77 -241L1134.72 44.2791L1265.37 -241H1242.77Z" fill="var(--primary-100)"/>
<path d="M1920 559.087L1355.22 497.41L1920 597.78V559.087Z" fill="var(--primary-100)"/>
<path d="M600.51 1052L787.48 730.514L570.297 1052H600.51Z" fill="var(--primary-100)"/>
<path d="M610.086 1052L760.952 783.692L585.313 1052H610.086Z" fill="var(--primary-100)"/>
<path d="M1920 72.936L1264.33 335.104L1920 122.74V72.936Z" fill="var(--primary-100)"/>
<path d="M377.839 1052L803.703 604.087L316.434 1052H377.839Z" fill="var(--primary-100)"/>
<path d="M1222.03 1052L1076.27 715.561L1195.81 1052H1222.03Z" fill="var(--primary-100)"/>
<path d="M1828.35 1052L1134.4 566.53L1737.59 1052H1828.35Z" fill="var(--primary-100)"/>
<path d="M753.2 1052L831.129 815.736L735.101 1052H753.2Z" fill="var(--primary-100)"/>
<path d="M1131.78 1052L1060.89 806.943L1114.17 1052H1131.78Z" fill="var(--primary-100)"/>
<path d="M57.3379 -241L793.779 303.474L152.434 -241H57.3379Z" fill="var(--primary-100)"/>
<path d="M1149.67 -241L1084.74 25.9318L1169.09 -241H1149.67Z" fill="var(--primary-100)"/>
<path d="M1339.68 1052L1081.09 636.973L1302.36 1052H1339.68Z" fill="var(--primary-100)"/>
<path d="M1920 414.112L1089.13 442.001L1920 469.889V414.112Z" fill="var(--primary-100)"/>
</g>
</g>
<defs>
<linearGradient id="paint0_linear_12671_22730" x1="960" y1="0" x2="960" y2="989" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint1_linear_12671_22730" x1="960" y1="0" x2="960" y2="989" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
</defs>
</svg>

`;

const ResultTopBanner = ({ className = '', leaderboard = false }: ResultTopBannerProps) => (
    <div
        className={`[&>svg]:block [&>svg]:w-full [&>svg]:h-full ${className}`}
        dangerouslySetInnerHTML={{ __html: leaderboard ? SVG_MARKUP_LEADERBOARD : SVG_MARKUP }}
    />
);

export default ResultTopBanner;
