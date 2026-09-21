/* GET travel page */

const travel = async (req, res) => {
    try {
        const apiUrl = process.env.TRAVLR_API_URL;

        if (!apiUrl) {
            throw new Error('TRAVLR_API_URL is not configured');
        }

        const response = await fetch(`${apiUrl}/trips`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const trips = await response.json();

        res.render('travel', {
            title: 'Travlr Getaways',
            trips
        });
    } catch (err) {
        console.error('Error retrieving trips:', err.message);
        res.status(500).send('Error retrieving trips');
    }
};

module.exports = {
    travel
};