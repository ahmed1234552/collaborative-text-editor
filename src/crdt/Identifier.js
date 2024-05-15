    class Identifier {
        constructor(digit, siteId) {
            this.digit = digit;
            this.siteId = siteId;
        }

        compareTo(otherId) {
            if (this.digit < otherId.digit) {
                return -1;
            } else if (this.digit > otherId.digit) {
                return 1;
            } else {
                if (this.siteId < otherId.siteId) {
                    return -1;
                } else if (this.siteId > otherId.siteId) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }

        // Getters
        getDigit() {
            return this.digit;
        }

        getSiteId() {
            return this.siteId;
        }
    }
    export default Identifier;

