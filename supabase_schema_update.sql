-- 1. Remove the old check constraint
-- Note: 'alerts_status_check' is the default name Supabase/Postgres gives to inline CHECK constraints.
-- If you named it differently, replace the name below.
ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_status_check;

-- 2. Add the new constraint with 'reported' instead of 'hidden'
ALTER TABLE public.alerts 
ADD CONSTRAINT alerts_status_check 
CHECK (status IN ('active', 'resolved', 'reported'));

-- 3. Update any existing 'hidden' alerts to 'reported' (optional cleanup)
UPDATE public.alerts SET status = 'reported' WHERE status = 'hidden';

-------------------------------------------------------------------------------
-- Trigger function already updated previously, but included here for completeness
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_alert_reports()
RETURNS trigger AS $$
DECLARE
    report_count integer;
BEGIN
    SELECT count(*) INTO report_count
    FROM public.alert_reports
    WHERE alert_id = new.alert_id;

    IF report_count >= 10 THEN
        UPDATE public.alerts
        SET status = 'reported'
        WHERE id = new.alert_id;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_alert_reported ON public.alert_reports;
CREATE TRIGGER on_alert_reported
    AFTER INSERT ON public.alert_reports
    FOR EACH ROW EXECUTE FUNCTION public.check_alert_reports();
