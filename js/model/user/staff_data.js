function StaffData() {
    this.staff = staff_raw; // staff.js
    this.currentUserID = 1;
}

StaffData.prototype = {
    getCurrentUserID: function() {
        return this.currentUserID;
    },

    getStaffByIndex: function(staffIndex) {
        return this.staff[staffIndex];
    },

    getStaffByID: function(staffID) {
        for(var i = 0; i < this.staff.length; i++) {
            if(this.staff[i].id == staffID) {
                return this.staff[i];
            }
        }

        return null;
    },

    getStaffIndexByID: function(staffID) {
        for(var i = 0; i < this.staff.length; i++) {
            if(this.staff[i].id == staffID) {
                return i;
            }
        }

        return -1;
    },

    getNumStaffMembers: function() {
        return this.staff.length;
    }
};