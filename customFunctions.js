/**
 * array [
 *          {nameOfButton, function(){}},
 *          ...
 *          ]
 */
var customFunc = [
    {name:"Alert",
        func: function(){
            alert("Hello, world!");
        }
    },
    {name:"Alert2",
        func: function(a){
            alert("Hello, "+ a);
        }
    },
    {name:"Rename",
        func: function(a) {
            var newName = prompt("Новое имя ", "Петруччо");
            kTable.changeRow(a,"name",newName);
        }
    }
];