import svgPaths from "./svg-acm8kley2g";
import clsx from "clsx";
import imgArmyStar from "figma:asset/5cfc8096705cf0c16b2b9c90484e0ad3656fe87d.png";
import imgImage1 from "figma:asset/084b17ffff4517e6eeaff5e8cb18bfb38cb8c3a9.png";
type ContainerBackgroundImageProps = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImageProps>) {
  return (
    <div className={clsx("absolute bg-[#e2e8f0] rounded-[3.35544e+07px] size-[40px] top-0", additionalClassNames)}>
      <div className="content-stretch flex flex-col items-start overflow-clip p-[2px] relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[3.35544e+07px]" />
    </div>
  );
}

export default function TanginangModsim() {
  return (
    <div className="bg-white relative size-full" data-name="tanginang modsim">
      <div className="absolute content-stretch flex h-[68px] items-center justify-between left-[61px] px-[24px] py-0 top-0 w-[1280px]" data-name="Navigation">
        <div className="h-[32px] relative shrink-0 w-[132.547px]" data-name="Container">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
            <div className="bg-black relative rounded-[10px] shrink-0 size-[32px]" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[6px] px-[6px] relative size-full">
                <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
                  <div className="absolute left-[-1px] size-[23px] top-[-1px]" data-name="Army Star">
                    <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-contain pointer-events-none size-full" src={imgArmyStar} />
                  </div>
                </div>
              </div>
            </div>
            <div className="basis-0 grow h-[28px] min-h-px min-w-px relative shrink-0" data-name="Text">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                <p className="font-['Arial:Bold',sans-serif] leading-[28px] not-italic relative shrink-0 text-[#0f172b] text-[20px] text-nowrap tracking-[-0.5px]">Shooting Stars</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[36px] relative shrink-0 w-[251.266px]" data-name="Container">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-start relative size-full">
            <div className="h-[36px] relative rounded-[8px] shrink-0 w-[115.125px]" data-name="Button">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
                <p className="font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#0f172b] text-[14px] text-center text-nowrap">How it works</p>
              </div>
            </div>
            <div className="basis-0 bg-[#030213] grow h-[36px] min-h-px min-w-px relative rounded-[3.35544e+07px] shrink-0" data-name="Button">
              <div className="flex flex-row items-center justify-center size-full">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[24px] py-[8px] relative size-full">
                  <p className="font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white">Get Started</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[739.5px] left-[85px] top-[148px] w-[1232px]" data-name="Main Content">
        <div className="absolute h-[533.875px] left-0 top-[102.81px] w-[592px]" data-name="Container">
          <div className="absolute bg-[#f1f5f9] border border-[#e2e8f0] border-solid h-[30px] left-0 rounded-[3.35544e+07px] top-0 w-[177.75px]" data-name="Container">
            <p className="absolute font-['Arial:Regular',sans-serif] leading-[20px] left-[28px] not-italic text-[#45556c] text-[14px] text-nowrap top-[2px]">Now live for students</p>
            <div className="absolute left-[12px] size-[8px] top-[10px]" data-name="Text">
              <div className="absolute bg-[#05df72] left-[-3.98px] opacity-[0.003] rounded-[3.35544e+07px] size-[15.966px] top-[-3.98px]" data-name="Text" />
              <div className="absolute bg-[#00c950] left-0 rounded-[3.35544e+07px] size-[8px] top-0" data-name="Text" />
            </div>
          </div>
          <div className="absolute h-[158.375px] left-0 top-[62px] w-[592px]" data-name="Heading 1">
            <p className="absolute font-['Arial:Black',sans-serif] leading-[79.2px] left-0 not-italic text-[#0f172b] text-[72px] text-nowrap top-[2px] tracking-[-1.8px]">{`Don’t Wish Upon a Star. `}</p>
            <div className="absolute content-stretch flex h-[96px] items-start left-0 top-[70.19px] w-[402.578px]" data-name="Text">
              <p className="bg-clip-text font-['Arial:Black',sans-serif] leading-[79.2px] not-italic relative shrink-0 text-[72px] text-[rgba(0,0,0,0)] text-nowrap tracking-[-1.8px]" style={{ WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(177.732deg, rgb(15, 57, 223) 77.388%, rgb(128, 228, 245) 84.254%, rgb(167, 208, 223) 168.02%)" }}>
                Build With One.
              </p>
            </div>
          </div>
          <div className="absolute h-[97.5px] left-0 top-[252.38px] w-[512px]" data-name="Paragraph">
            <p className="absolute font-['Arial:Regular',sans-serif] leading-[32.5px] left-0 not-italic text-[#45556c] text-[20px] top-[-3px] w-[507px]">Your perfect teammate is out there. Catch your Shooting Star. Trade talent. Build projects. No wallet required</p>
          </div>
          <div className="absolute h-[59.5px] left-[56px] top-[320.19px] w-[477.797px]" data-name="Text" />
          <div className="absolute content-stretch flex gap-[16px] h-[48px] items-start left-0 top-[381.88px] w-[592px]" data-name="Container">
            <div className="bg-black h-[48px] relative rounded-[3.35544e+07px] shrink-0 w-[201px]" data-name="Button">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                <p className="absolute font-['Arial:Regular',sans-serif] leading-[24px] left-[86px] not-italic text-[16px] text-center text-nowrap text-white top-[10px] translate-x-[-50%]">Connect with a star</p>
                <div className="absolute left-[170px] size-[16px] top-[16px]" data-name="Icon">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <g id="Icon">
                      <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      <path d={svgPaths.p1d405500} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white h-[48px] relative rounded-[3.35544e+07px] shrink-0 w-[214.234px]" data-name="Button">
              <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[3.35544e+07px]" />
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[33px] py-px relative size-full">
                <p className="font-['Arial:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] text-center text-nowrap">View Success Stories</p>
              </div>
            </div>
          </div>
          <div className="absolute content-stretch flex gap-[16px] h-[72px] items-center left-0 top-[461.88px] w-[592px]" data-name="Container">
            <div className="h-[40px] relative shrink-0 w-[124px]" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                <ContainerBackgroundImage additionalClassNames="left-0">
                  <div className="h-[36px] shrink-0 w-full" data-name="Image (User)" />
                </ContainerBackgroundImage>
                <ContainerBackgroundImage additionalClassNames="left-[28px]">
                  <div className="h-[36px] shrink-0 w-full" data-name="Image (User)" />
                </ContainerBackgroundImage>
                <ContainerBackgroundImage additionalClassNames="left-[56px]">
                  <div className="h-[36px] shrink-0 w-full" data-name="Image (User)" />
                </ContainerBackgroundImage>
                <ContainerBackgroundImage additionalClassNames="left-[84px]">
                  <div className="h-[36px] shrink-0 w-full" data-name="Image (User)" />
                </ContainerBackgroundImage>
              </div>
            </div>
            <div className="h-[20px] relative shrink-0 w-[162.172px]" data-name="Paragraph">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
                <p className="font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#62748e] text-[14px] text-nowrap">Joined by 2,000+ students</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-[745px] size-[512px] top-[264px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
    </div>
  );
}