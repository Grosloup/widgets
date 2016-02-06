/**
 * Created by nicolas on 05/02/16.
 */


;(function($, window, document, undefined){

    var pluginName = "nicoCalendar";
    var defaults = {
        langFr: {
            days: ["l", "ma", "me", "j", "v", "s", "d"],
            monthes: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
        },
        prefix: "nc-calendar__",
        startDate: null,
        endDate: null,
        onChange: function(date){},
        onMonthChange: function(month, year){}
    };

    function NicoCalendar(element, options){
        this.el = element;
        this.$el = $(element);
        this.opt = $.extend(true, {}, defaults, options);


        this.initVars();
        this.build();

    }

    NicoCalendar.prototype = {
        initVars: function(){
            this.startDate = null;
            if(this.opt["startDate"] != null){
                var durb = {};
                durb[this.opt["startDate"][1]] = this.opt["startDate"][0];
                this.startDate = moment(this.today).add(moment.duration(durb));
            }
            if(this.opt["endDate"] != null){
                var dura = {};
                dura[this.opt["endDate"][1]] = this.opt["endDate"][0];
                this.endDate = moment(this.today).add(moment.duration(dura));
                console.log(this.endDate);
            }
            this.today = new Date();
            this.currentDate = this.today.getDate();
            this.currentMonth = this.today.getMonth();
            this.currentYear = this.today.getFullYear();
            this.activeDay = this.today;
        },

        build : function(){
            var self, opt, pfx;
            opt = this.opt; pfx = opt["prefix"];
            this.root =
                $("<div/>",
                    {
                        "class": "nc-calendar"
                    }
                );

            this.header =
                $("<div/>",
                    {
                        "class": pfx + "header"
                    }
                );

            this.prevMonth = 
                $("<div/>",
                    {
                        "class": pfx + "col" + " " + pfx + "left"
                    }
                ).html("<i class='fa fa-chevron-left'></i>");
            
            this.current =
                $("<div/>",
                    {
                        "class": pfx + "current"
                    }
                );
            
            this.nextMonth =
                $("<div/>",
                    {
                        "class": pfx + "col" + " " + pfx + "right"
                    }
                ).html("<i class='fa fa-chevron-right'></i>");

            this.header.append(this.prevMonth, this.current, this.nextMonth);
            
            this.dayNames =
                $("<div/>",
                    {
                        "class": pfx + "day-names"
                    }
                );
            
            for(var d=0; d<7; d++){
                var c = pfx + "col" + " " + pfx + "day-name";
                var e =
                    $("<div/>",
                        {
                            "class": c, text: opt.langFr.days[d]
                        }
                    );
                this.dayNames.append(e);
            }

            this.days =
                $("<div/>",
                    {
                        "class": opt["prefix"] + "days"
                    }
                );





            
            this.root.append(this.header, this.dayNames, this.days);

            this.$el.append(this.root);
            this.updateMonth();


            self = this;
            this.current.on("click", function(e){
                e.preventDefault();
                self.setDate(moment(self.today).format("YYYY-MM-DD"));
            });

            this.prevMonth.on("click", function(e){
                e.preventDefault();
                self.updateMonth(-1);
            });

            this.nextMonth.on("click", function(e){
                e.preventDefault();
                self.updateMonth(1);
            });


        },

        updateMonth: function(v){
            if(!v){ v= 0; }
            this.currentMonth += v;
            if(this.currentMonth < 0){
                this.currentMonth = 11;
                this.updateYear(-1);
            } else if(this.currentMonth > 11) {
                this.currentMonth = 0;
                this.updateYear(1);
            }
            this.opt.onMonthChange(this.currentMonth, this.currentYear);
            this.deactiveDay();
            this.changeHeader();
            this.update();
        },

        updateYear: function(v){
            this.currentYear += v;
        },

        changeHeader: function(){
            this.current.text(this.opt.langFr.monthes[this.currentMonth] + " " + this.currentYear);
        },

        update: function(){

            var opt, pfx, self,
                numDaysInMonth,
                firstDay, addDayBefore,
                lastDay, addDayAfter,
                totalCells, totalRows,
                dayNum;
            opt = this.opt; pfx = opt["prefix"]; self=this;
            this.$el.find("." + pfx + "day").off("click");
            this.days.empty();
            this.Datas = {};
            numDaysInMonth = moment([this.currentYear, this.currentMonth]).endOf("month").date();
            firstDay = moment([this.currentYear, this.currentMonth, 1]).day();
            firstDay = (firstDay == 0) ? 6 : firstDay - 1;
            addDayBefore = firstDay;
            lastDay = moment([this.currentYear, this.currentMonth, numDaysInMonth]).day();
            lastDay = (lastDay == 0) ? 6 : lastDay - 1;
            addDayAfter = 6 - lastDay;
            totalCells = addDayBefore + numDaysInMonth + addDayAfter;
            totalRows = totalCells / 7;
            dayNum = 1;
            for(var r=0; r< totalRows; r++){
                var row;
                row =
                    $("<div/>",
                        {
                            "class": pfx + "row"
                        }
                    );
                for(var c=0; c<7; c++){
                    var cell;
                    cell =
                        $("<div/>",
                            {
                                "class": pfx + "col" + " " + pfx + "day"
                            }
                        );
                    if(r==0 && c<addDayBefore){
                        cell.addClass("empty");
                        cell.text("-");
                    }else if(r == totalRows-1 && c > lastDay){
                        cell.addClass("empty");
                        cell.text("-");
                    } else{
                        cell.text(dayNum);
                        var m;
                        m = moment([this.currentYear, this.currentMonth, dayNum]);
                        this.Datas[dayNum] = m.format("YYYY-MM-DD");
                        if(this.currentMonth == this.today.getMonth() && this.currentYear == this.today.getFullYear() && dayNum == this.today.getDate()){
                            cell.addClass("today");
                        }
                        if(this.currentMonth == this.activeDay.getMonth() && this.currentYear == this.activeDay.getFullYear() && dayNum == this.activeDay.getDate()){
                            cell.addClass("active");
                        }
                        if(
                            (this.startDate == null || (this.startDate && m.isSameOrAfter(this.startDate.format("YYYY-MM-DD")))) &&
                            (this.endDate == null || (this.endDate && m.isSameOrBefore(this.endDate.format("YYYY-MM-DD"))))
                        ){
                            cell.on("click", function(e){
                                e.preventDefault();
                                self.deactiveDay();
                                self.activateDay(self.Datas[parseInt($(this).text())]);
                                $(this).addClass("active");
                                self.opt["onChange"](self.Datas[parseInt($(this).text())]);
                            });
                        }

                        dayNum++;
                    }
                    row.append(cell);
                }
                this.days.append(row);
            }
        },

        deactiveDay: function(){
            this.days.find(".active").removeClass("active");
        },

        activateDay: function(date){
            this.activeDay = new Date(date);
        },

        setDate: function(date){
            var m;
            this.activateDay(date);
            m = moment(date);
            this.currentYear = m.year();
            this.currentMonth = m.month();
            this.currentDate = m.date();
            this.changeHeader();
            this.update();
        }
    };



    $.fn[pluginName] = function(options){
        return this.each(
            function(){
                if(!$.data(this, "plugin_"+pluginName)){
                    $.data(this, "plugin_"+pluginName, new NicoCalendar(this, options));
                }
            }
        );
    };


})(jQuery, window, document);