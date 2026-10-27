"use client";

import { CollapsibleSection } from "@features/journey-result/components/CollapsibleSection";
import { useProfessionalProfileSummaryVM } from "./professionalProfileSummary.viewmodel";
import type { ProfessionalProfileSummaryProps } from "./professionalProfileSummary.types";

const CHIP_CLASS_NAME =
  "rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground";

/** Dados informados no pré-questionário da jornada. */
export function ProfessionalProfileSummary(props: ProfessionalProfileSummaryProps) {
  const { profile, labels, hasCourses, hasCertifications } =
    useProfessionalProfileSummaryVM(props);

  return (
    <CollapsibleSection
      eyebrow={labels.eyebrow}
      title={labels.title}
      testId="professional-profile-summary"
    >
      <div className="space-y-7">
        <dl className="grid gap-6 md:grid-cols-3">
          {profile.fields.map((field) => (
            <div key={field.id}>
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd className="mt-2 text-sm font-medium text-foreground">{field.value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">{labels.coursesTitle}</h3>
          {hasCourses ? (
            <div className="grid gap-5 md:grid-cols-2">
              {profile.courseGroups.map((group) => (
                <div key={group.id}>
                  <h4 className="mb-2 text-xs text-muted-foreground">{group.name}</h4>
                  <ul className="flex flex-wrap gap-2">
                    {group.courses.map((course) => (
                      <li key={course.id} className={CHIP_CLASS_NAME}>
                        {course.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{labels.noCourses}</p>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {labels.certificationsTitle}
          </h3>
          {hasCertifications ? (
            <ul className="flex flex-wrap gap-2">
              {profile.certifications.map((certification) => (
                <li key={certification.id} className={CHIP_CLASS_NAME}>
                  {certification.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">{labels.noCertifications}</p>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}

export * from "./professionalProfileSummary.types";
