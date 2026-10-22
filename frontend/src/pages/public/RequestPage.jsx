import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { publicApi } from '../../services/publicApi.js';
import { useResource } from '../../hooks/useResource.js';
import { useInterval } from '../../hooks/useInterval.js';
import { useMaterialSelection } from '../../hooks/useMaterialSelection.js';
import { useRequestSubmission } from '../../hooks/useRequestSubmission.js';
import { collapseSpaces, validateRequesterName } from '../../utils/text.js';
import { Button } from '../../components/common/Button.jsx';
import { EmptyState, ErrorState, Skeleton, StatusPill } from '../../components/common/Feedback.jsx';
import { FormHero, TopBar } from '../../components/form/FormHero.jsx';
import { Step } from '../../components/form/Step.jsx';
import { RequesterSection } from '../../components/form/RequesterSection.jsx';
import { CatalogSection } from '../../components/form/CatalogSection.jsx';
import { AddCustomModal, CustomMaterials } from '../../components/form/CustomMaterials.jsx';
import { SelectionBar } from '../../components/form/SelectionBar.jsx';
import { ReviewModal } from '../../components/form/ReviewModal.jsx';
import { ClosedScreen, SuccessScreen } from '../../components/form/StateScreens.jsx';
import { ClosedModal, NoticeModal } from '../../components/form/ScheduleModals.jsx';
import { EvidenceModal } from '../../components/form/EvidenceModal.jsx';
import { useReceipt } from '../../hooks/useReceipt.js';

const LoadingView = () => (
  <div style={{ display: 'grid', gap: 18, padding: '40px 0' }} aria-busy="true" aria-label="Cargando formulario">
    <Skeleton height={110} width="70%" radius={24} />
    <Skeleton height={24} width="40%" />
    <Skeleton height={320} radius={32} />
  </div>
);

const RequestForm = ({ config, availability, onClosed, onReloadCatalog }) => {
  const { categories, branches, limits } = config;
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const selection = useMaterialSelection(categories);

  const onUnavailable = useCallback(
    async (ids) => {
      const blocked = new Set(ids);
      const fresh = await onReloadCatalog();
      const valid = new Set((fresh?.categories ?? categories).flatMap((c) => c.materials.map((m) => m.id)).filter((id) => !blocked.has(id)));
      selection.prune(valid);
    },
    [categories, onReloadCatalog, selection]
  );

  const submission = useRequestSubmission({ onClosed, onUnavailable });

  const receipt = useReceipt();
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const { generate } = receipt;

  useEffect(() => {
    if (submission.status !== 'success') return;
    window.scrollTo({ top: 0 });
    setEvidenceOpen(true);
    generate(submission.result, availability.timezone);
  }, [submission.status, submission.result, availability.timezone, generate]);

  const nameError = validateRequesterName(name, limits);
  const branch = branches.find((b) => b.id === branchId);
  const missing = [nameError && 'nombre completo', !branch && 'sucursal', selection.total === 0 && 'al menos un material'].filter(Boolean);
  const canReview = missing.length === 0 && availability.isOpen;

  const recent = useMemo(() => {
    const names = selection.ids
      .slice(-3)
      .map((id) => selection.catalogIndex.byId.get(id)?.name)
      .filter(Boolean);
    return [...names, ...selection.custom.slice(-1).map((c) => c.name)].join(' · ');
  }, [selection.ids, selection.custom, selection.catalogIndex]);

  const summary = { name: collapseSpaces(name), branch: branch?.name, groups: selection.grouped, custom: selection.custom, total: selection.total };

  const openReview = () => {
    if (!canReview) return;
    submission.prepare();
    setReviewOpen(true);
    import('../../pdf/receiptStrategies.js').catch(() => {});
  };

  const confirm = () =>
    submission.submit({
      requesterName: collapseSpaces(name),
      branchId,
      materialIds: selection.ids,
      customMaterials: selection.custom.map((c) => c.name)
    });

  const restart = () => {
    selection.reset();
    setName('');
    setBranchId(null);
    setReviewOpen(false);
    submission.reset();
    receipt.reset();
    setEvidenceOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCustom = (draft = '') => {
    setCustomDraft(draft);
    setCustomOpen(true);
  };

  if (submission.status === 'success') {
    return (
      <>
        <SuccessScreen
          request={submission.result}
          timeZone={availability.timezone}
          onRestart={restart}
          onEvidence={() => setEvidenceOpen(true)}
        />
        <EvidenceModal
          open={evidenceOpen}
          onClose={() => setEvidenceOpen(false)}
          receipt={receipt}
          request={submission.result}
          onRetry={() => generate(submission.result, availability.timezone)}
        />
      </>
    );
  }

  return (
    <>
      {!availability.isOpen && (
        <div className="closing-banner" role="alert">
          El horario de solicitudes terminó. Tu selección se conserva, pero no podrás enviarla hasta la próxima apertura.
        </div>
      )}
      <FormHero
        stats={[
          { value: categories.reduce((s, c) => s + c.materials.length, 0), label: 'Materiales' },
          { value: categories.length, label: 'Categorías' },
          { value: branches.length, label: 'Sucursales' }
        ]}
      />
      <Step id="datos" number={1} title="Tus datos" description="¿Quién solicita y para qué sucursal?" done={!nameError && Boolean(branch)}>
        <RequesterSection name={name} onNameChange={setName} nameError={nameError} branches={branches} branchId={branchId} onBranchChange={setBranchId} limits={limits} />
      </Step>
      <Step id="materiales" number={2} title="Materiales" description="Toca cada material que necesitas. Puedes elegir uno, varios o todos." done={selection.ids.length > 0}>
        <CatalogSection categories={categories} selection={selection} onAddCustom={openCustom} />
      </Step>
      <Step id="adicionales" number={3} title="Materiales adicionales" description="Solo si no encontraste lo que necesitas en el catálogo." done={selection.custom.length > 0}>
        <CustomMaterials items={selection.custom} onRemove={selection.removeCustom} onAdd={openCustom} />
      </Step>
      <div className="review-cta">
        <div className="review-cta__missing" aria-live="polite">
          {missing.length ? missing.map((m) => <StatusPill key={m} tone="closed">Falta {m}</StatusPill>) : <StatusPill tone="open">Todo listo para revisar</StatusPill>}
        </div>
        <Button variant="coral" iconRight={ArrowRight} disabled={!canReview} onClick={openReview}>
          Revisar solicitud
        </Button>
      </div>
      <SelectionBar total={selection.total} recent={recent} canReview={canReview} missing={missing} onReview={openReview} />
      <AddCustomModal open={customOpen} initialValue={customDraft} onClose={() => setCustomOpen(false)} selection={selection} limits={limits} />
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={confirm}
        submitting={submission.submitting}
        error={submission.error}
        summary={summary}
        timeZone={availability.timezone}
      />
    </>
  );
};

export default function RequestPage() {
  const config = useResource(() => publicApi.config(), []);
  const [availability, setAvailability] = useState(null);
  const current = availability ?? config.data?.availability;

  useInterval(async () => {
    try {
      setAvailability(await publicApi.availability());
    } catch {
      return;
    }
  }, 60000);

  const [forceClosed, setForceClosed] = useState(false);
  const [formShown, setFormShown] = useState(false);
  const isOpen = Boolean(current?.isOpen);

  useEffect(() => {
    if (isOpen) {
      setFormShown(true);
      setForceClosed(false);
    }
  }, [isOpen]);

  const onClosed = useCallback(
    (next) => {
      setAvailability(next ?? { ...current, isOpen: false });
      setForceClosed(true);
    },
    [current]
  );

  const showForm = !forceClosed && (isOpen || formShown);
  const mode = config.loading && !config.data ? 'loading' : config.error ? 'error' : showForm ? 'open' : 'closed';
  const catalogReady = Boolean(config.data?.categories.length && config.data?.branches.length);
  const [modal, setModal] = useState(null);
  const noticeShown = useRef(false);

  useEffect(() => {
    if (mode === 'open' && catalogReady && !noticeShown.current) {
      noticeShown.current = true;
      setModal('notice');
    }
    if (mode === 'closed') setModal('closed');
    if (mode === 'open' && !isOpen) setModal(null);
  }, [mode, catalogReady, isOpen]);

  const closeClosedModal = () => {
    setModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="public">
      <div className="public__inner">
        <TopBar availability={current} />
        <AnimatePresence mode="wait">
          <motion.main key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {config.loading && !config.data ? (
              <LoadingView />
            ) : config.error ? (
              <div style={{ padding: '60px 0' }}>
                <ErrorState error={config.error} onRetry={config.reload} />
              </div>
            ) : showForm && !catalogReady ? (
              <div style={{ padding: '80px 0' }}>
                <EmptyState icon={PackageOpen} title="Catálogo en preparación">
                  Aún no hay sucursales o materiales disponibles. Intenta de nuevo más tarde.
                </EmptyState>
              </div>
            ) : showForm ? (
              <RequestForm config={config.data} availability={current} onClosed={onClosed} onReloadCatalog={() => config.reload({ silent: true })} />
            ) : (
              <ClosedScreen availability={current} />
            )}
          </motion.main>
        </AnimatePresence>
      </div>
      {current && (
        <>
          <NoticeModal open={modal === 'notice' && isOpen} onClose={() => setModal(null)} availability={current} />
          <ClosedModal open={modal === 'closed'} onClose={closeClosedModal} availability={current} />
        </>
      )}
    </div>
  );
}
