import React from "react";

export default function Refund() {
  return (
    <section className="container mx-auto max-w-3xl px-6 md:px-8 py-20 bg-offwhite text-forest">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Booking Changes &amp; Cancellations — Highway to Heal (H2H)</h1>
      <p className="mt-3 text-forest/70">Last updated: 1 November 2025</p>

      <div className="mt-10 space-y-10 text-forest/90 leading-7">
        <div>
          <h2 className="text-xl font-semibold text-forest">1. Booking Changes &amp; Cancellations — Highway to Heal (H2H)</h2>

          <h3 className="mt-6 text-lg font-semibold text-forest">1.1 Change/Cancellation of Booking by the Participant</h3>
          <h4 className="mt-4 font-medium text-forest">1.1.1 Process</h4>
          <p className="mt-2">The cancellation/change process is automated. Please log in to your Highway to Heal (H2H) account dashboard and follow the instructions shown against your booking. You can choose your preferred refund mode (Cash/Voucher) subject to the policy below. Once submitted, refunds are auto-processed by the system.</p>
          <p className="mt-2">For assistance, write to <a className="underline text-primary hover:text-primary/90" href="mailto:support@highwaytoheal.in">support@highwaytoheal.in</a> (attach relevant screenshots/order ID).</p>

          <h4 className="mt-4 font-medium text-forest">1.1.2 Replacement of Participant(s)</h4>
          <p className="mt-2">You may replace a participant from your H2H account dashboard when the booking status is “Paid” and at least 5 days remain before the event start date (start date − 5 days).</p>
          <p className="mt-2">If the dashboard replacement fails, email <a className="underline text-primary hover:text-primary/90" href="mailto:support@highwaytoheal.in">support@highwaytoheal.in</a> with the error screenshot. The new participant must submit the signed undertaking form (scan/email to <a className="underline text-primary hover:text-primary/90" href="mailto:support@highwaytoheal.in">support@highwaytoheal.in</a>).</p>
          <p className="mt-2"><span className="font-medium text-forest">Note:</span> Replacement does not apply to any Volvo/Train/transport booked for the original participant; such transport components are non-transferable and non-refundable.</p>

          <h4 className="mt-4 font-medium text-forest">1.1.3 Cash Refund (Cancellation Window &amp; Charge)</h4>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><span className="font-medium text-forest">Cancellation window:</span> Only within 7 (seven) calendar days from the booking date.</li>
            <li>After Day 7, no cancellation or refund is permitted.</li>
            <li><span className="font-medium text-forest">Cancellation charge:</span> A flat 30% of the Net Amount Paid* will be deducted.</li>
            <li>The balance 70% will be refunded to the original payment method.</li>
            <li>No cash refund if the booking was made using any promotional code/voucher for the paid portion covered by that voucher (see Voucher Refund below). Shifted/postponed batch bookings are not eligible for cash refunds.</li>
            <li><span className="font-medium text-forest">Refund basis:</span> Refund calculations are always on the Net Amount Paid* for the Base Price component only (exclusive of add-ons like transport, insurance, rentals, portage, etc., which are non-refundable).</li>
          </ul>
          <p className="mt-2 text-forest/70">* Net Amount Paid = amount actually paid in cash to H2H after adjusting any vouchers/credits applied at checkout.</p>

          <h4 className="mt-4 font-medium text-forest">1.1.4 Voucher Refund</h4>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><span className="font-medium text-forest">Eligibility:</span> Available for all bookings (including those made with promo codes/vouchers), only within 7 days from booking date. After Day 7, no voucher refund is permitted.</li>
            <li><span className="font-medium text-forest">Deduction:</span> Voucher value issued will be Net Amount Paid less a flat 30% cancellation charge (same as cash cancellation charge).</li>
            <li><span className="font-medium text-forest">Validity:</span> Voucher validity is 12 months from the date of issue.</li>
            <li><span className="font-medium text-forest">Tax note:</span> Voucher amount excludes any non-refundable government taxes/charges, where applicable. When a voucher is redeemed later, taxes will apply only to any additional cash amount paid then (as per law).</li>
          </ul>
          <p className="mt-2">Transport add-ons (e.g., station transfers/Volvo/Train), insurance, portage and similar third-party components are completely non-refundable, whether cash or voucher.</p>

          <h3 className="mt-8 text-lg font-semibold text-forest">1.2 Cancellation or Change Initiated by H2H</h3>
          <p className="mt-2">H2H may cancel your booking or change facilities/services/prices described on our website or materials. We plan events months in advance; minor changes (including transport timings/carriers) may occur.</p>
          <h4 className="mt-4 font-medium text-forest">Force Majeure &amp; Unforeseeable Events</h4>
          <p className="mt-2">Events beyond our control (illustrative, not exhaustive): severe weather, landslides, road closures, riots/civil disturbances, strikes, actual or threatened terrorism, natural disasters, fire, epidemics/pandemics/health risks, government bans/orders, acts of God, unavoidable technical issues with transport, congested/closed ports, hurricanes, and similar contingencies.</p>
          <p className="mt-2">If such circumstances require an itinerary change or cancellation, you may choose:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>An alternate H2H event of equivalent/similar standard and price (subject to availability), or</li>
            <li>Cancellation with a full refund of base and included components.</li>
          </ul>
          <h4 className="mt-4 font-medium text-forest">Refund form:</h4>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>If the change/cancellation arises from force majeure or reasons beyond our control, refunds are issued as vouchers (valid 6 months).</li>
            <li>If the cancellation is for other operational reasons (e.g., low participation), you may choose between a 6-month voucher or cash refund.</li>
            <li>For bookings made using a voucher, any cash refund will only cover the cash portion; the consumed voucher will be re-activated with an additional 6-month validity.</li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold text-forest">1.3 Changes/Cancellation After Departure</h3>
          <h4 className="mt-4 font-medium text-forest">1.3.1 Force Majeure/Uncontrollable Reasons</h4>
          <p className="mt-2">If changes/cancellation occur after departure due to force majeure or reasons beyond our control, H2H is not liable to refund amounts already utilized.</p>
          <h4 className="mt-4 font-medium text-forest">1.3.2 Other Reasons</h4>
          <p className="mt-2">We will make reasonable alternative arrangements wherever possible. If no suitable alternative is available (or you reject it with good reason), we will return you to the point of departure and refund any unused services as appropriate. The default refund mode is a voucher (6-month validity); cash refund may be provided upon your request where feasible.</p>

          <h3 className="mt-8 text-lg font-semibold text-forest">1.4 Participant Drop-Out Mid-Event</h3>
          <p className="mt-2">No refunds are due if a participant voluntarily drops out during the event. Any additional/unplanned evacuation or retreat arrangements will be billed at actuals. If safe retreat arrangements are not feasible, H2H may deny mid-event drop-outs in the interest of group safety.</p>

          <h3 className="mt-8 text-lg font-semibold text-forest">1.5 Early Return From Event</h3>
          <p className="mt-2">If the event completes earlier than estimated, or early return is required due to force majeure/operational safety, any extra services/nights required will be borne by the participant(s).</p>

          <h3 className="mt-8 text-lg font-semibold text-forest">1.6 Emergency Evacuation</h3>
          <p className="mt-2">H2H teams carry first-aid and have trained leads; however, emergencies can occur. H2H will arrange safe evacuation to the nearest accessible road-head and assist with onward transport to the nearest hospital/facility. All costs incurred for evacuation and subsequent care (porters, vehicles, ambulance, hospitalization, etc.) are payable by the participant.</p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-forest">Quick Reference (H2H Policy Snapshot)</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Cancellation window: Within 7 days of booking only.</li>
              <li>Cancellation charge: 30% (cash or voucher route).</li>
              <li>After Day 7: No cancellation/refund (cash or voucher).</li>
              <li>Replacements: Allowed till 5 days before event start (transport add-ons excluded).</li>
              <li>Transport/insurance/portage add-ons: Non-refundable.</li>
              <li>Force majeure cancellations by H2H: Voucher (6 months) by default; cash possible where applicable.</li>
              <li>Voucher validity (participant-initiated cancellations): 12 months.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
